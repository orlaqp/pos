import * as path from 'path';
import { promises as fs } from 'fs';

import type {
  ImageManifestCandidate,
  ImageManifestDiscoveryOptions,
  ImageManifestDiscoveryReport,
  ImageManifestEntry,
  ImageMigrationReport,
  ImageModel,
} from './image-types';

const MANIFEST_FILENAME = 'manifest.json';
const IMAGE_OUTPUT_DIRECTORY = 'image-bg-removal';
const MAX_SEARCH_DEPTH = 6;

const safeReadDir = async (dirPath: string) => {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
};

const discoverManifestPaths = async (
  rootPath: string,
  maxDepth = MAX_SEARCH_DEPTH
): Promise<string[]> => {
  const manifests: string[] = [];
  const queue: Array<{ dirPath: string; depth: number }> = [
    { dirPath: rootPath, depth: 0 },
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current.dirPath)) {
      continue;
    }

    visited.add(current.dirPath);
    const entries = await safeReadDir(current.dirPath);

    for (const entry of entries) {
      const fullPath = path.join(current.dirPath, entry.name);
      if (entry.isFile() && entry.name === MANIFEST_FILENAME) {
        manifests.push(fullPath);
        continue;
      }

      if (!entry.isDirectory()) {
        continue;
      }

      if (current.depth >= maxDepth) {
        continue;
      }

      if (
        current.depth > 0 &&
        !fullPath.includes(IMAGE_OUTPUT_DIRECTORY) &&
        !entry.name.includes(IMAGE_OUTPUT_DIRECTORY)
      ) {
        queue.push({ dirPath: fullPath, depth: current.depth + 1 });
        continue;
      }

      queue.push({ dirPath: fullPath, depth: current.depth + 1 });
    }
  }

  return manifests;
};

const toNumberOrNull = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const createCandidate = async (
  manifestPath: string,
  options: ImageManifestDiscoveryOptions
): Promise<ImageManifestCandidate | null> => {
  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ImageMigrationReport>;
    const entries = Array.isArray(parsed.entries)
      ? (parsed.entries as ImageManifestEntry[])
      : [];
    const preflight = parsed.preflight;

    if (!preflight || preflight.env !== options.env) {
      return null;
    }

    if (options.tenantId && preflight.tenantId !== options.tenantId) {
      return null;
    }

    const requestedModels = new Set(options.models);
    const updatedEntries = entries.filter(
      (entry) =>
        requestedModels.has(entry.model) &&
        (!options.tenantId || entry.tenantId === options.tenantId) &&
        entry.status === 'updated'
    );

    if (!options.includeNonUpdated && updatedEntries.length === 0) {
      return null;
    }

    const matchedModels = Array.from(
      new Set(updatedEntries.map((entry) => entry.model))
    ) as ImageModel[];
    const stats = await fs.stat(manifestPath);

    return {
      manifestPath,
      outputDir:
        typeof preflight.outputDir === 'string' ? preflight.outputDir : null,
      modifiedAt: stats.mtime.toISOString(),
      matchedModels,
      updatedEntries: updatedEntries.length,
      totalEntries: entries.length,
      preflight: {
        env: typeof preflight.env === 'string' ? preflight.env : null,
        profile:
          typeof preflight.profile === 'string' ? preflight.profile : null,
        tenantId:
          typeof preflight.tenantId === 'string' ? preflight.tenantId : null,
        models: Array.isArray(preflight.models)
          ? preflight.models.map((model) => String(model))
          : [],
        dryRun:
          typeof preflight.dryRun === 'boolean' ? preflight.dryRun : null,
      },
      counts: {
        discovered: toNumberOrNull(parsed.counts?.discovered),
        processed: toNumberOrNull(parsed.counts?.processed),
        skipped: toNumberOrNull(parsed.counts?.skipped),
        failed: toNumberOrNull(parsed.counts?.failed),
        updated: toNumberOrNull(parsed.counts?.updated),
      },
    };
  } catch {
    return null;
  }
};

const compareCandidates = (
  left: ImageManifestCandidate,
  right: ImageManifestCandidate
) => {
  if (right.updatedEntries !== left.updatedEntries) {
    return right.updatedEntries - left.updatedEntries;
  }

  if (right.matchedModels.length !== left.matchedModels.length) {
    return right.matchedModels.length - left.matchedModels.length;
  }

  if (right.totalEntries !== left.totalEntries) {
    return right.totalEntries - left.totalEntries;
  }

  return right.modifiedAt.localeCompare(left.modifiedAt);
};

export const findImageManifests = async (
  options: ImageManifestDiscoveryOptions
): Promise<ImageManifestDiscoveryReport> => {
  const roots = Array.from(new Set((options.roots ?? []).map((root) => path.resolve(root))));
  const manifestPaths = new Set<string>();

  for (const root of roots) {
    const discovered = await discoverManifestPaths(root);
    for (const manifestPath of discovered) {
      if (manifestPath.includes(IMAGE_OUTPUT_DIRECTORY)) {
        manifestPaths.add(manifestPath);
      }
    }
  }

  const candidates = (
    await Promise.all(
      Array.from(manifestPaths).map((manifestPath) =>
        createCandidate(manifestPath, options)
      )
    )
  )
    .filter((candidate): candidate is ImageManifestCandidate => candidate != null)
    .sort(compareCandidates);

  return {
    rootsSearched: roots,
    candidates:
      typeof options.limit === 'number'
        ? candidates.slice(0, options.limit)
        : candidates,
  };
};
