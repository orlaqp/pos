import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';

import { findImageManifests } from './image-find';
import type { ImageMigrationReport } from './image-types';

const createManifest = async (
  baseDir: string,
  relativeDir: string,
  report: Partial<ImageMigrationReport>
) => {
  const outputDir = path.join(baseDir, relativeDir);
  await fs.mkdir(outputDir, { recursive: true });
  const manifestPath = path.join(outputDir, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(report, null, 2), 'utf8');
  return manifestPath;
};

describe('findImageManifests', () => {
  let tempRoot = '';

  beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'image-find-'));
  });

  afterEach(async () => {
    if (tempRoot) {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });

  it('returns updated manifests that match the requested env and tenant', async () => {
    await createManifest(tempRoot, 'tools-output/image-bg-removal/run-a', {
      preflight: {
        env: 'prod',
        profile: 'pos',
        tenantId: 'tenant-1',
        models: ['products', 'categories'],
        dryRun: false,
        outputDir: path.join(tempRoot, 'tools-output/image-bg-removal/run-a'),
      },
      entries: [
        {
          model: 'products',
          recordId: 'prod-1',
          tenantId: 'tenant-1',
          originalKey: 'tenant-1/products/a.jpg',
          backupPath: '/tmp/a',
          processedPath: '/tmp/b',
          newKey: 'tenant-1/products/a.bg-removed.png',
          originalBytes: 1,
          processedBytes: 1,
          status: 'updated',
        },
      ],
      counts: {
        discovered: 1,
        processed: 1,
        skipped: 0,
        failed: 0,
        updated: 1,
      },
    });

    await createManifest(tempRoot, 'tools-output/image-bg-removal/run-b', {
      preflight: {
        env: 'prod',
        profile: 'pos',
        tenantId: 'tenant-1',
        models: ['products'],
        dryRun: true,
        outputDir: path.join(tempRoot, 'tools-output/image-bg-removal/run-b'),
      },
      entries: [
        {
          model: 'products',
          recordId: 'prod-2',
          tenantId: 'tenant-1',
          originalKey: 'tenant-1/products/b.jpg',
          backupPath: '/tmp/a',
          processedPath: '/tmp/b',
          newKey: 'tenant-1/products/b.bg-removed.png',
          originalBytes: 1,
          processedBytes: 1,
          status: 'dry-run',
        },
      ],
      counts: {
        discovered: 1,
        processed: 1,
        skipped: 0,
        failed: 0,
        updated: 0,
      },
    });

    const report = await findImageManifests({
      env: 'prod',
      tenantId: 'tenant-1',
      models: ['products', 'categories'],
      roots: [tempRoot],
    });

    expect(report.rootsSearched).toEqual([path.resolve(tempRoot)]);
    expect(report.candidates).toHaveLength(1);
    expect(report.candidates[0]?.updatedEntries).toBe(1);
    expect(report.candidates[0]?.preflight.dryRun).toBe(false);
  });

  it('can include non-updated manifests when requested', async () => {
    await createManifest(tempRoot, 'tools-output/image-bg-removal/run-c', {
      preflight: {
        env: 'develop',
        profile: 'pos',
        tenantId: 'tenant-2',
        models: ['products'],
        dryRun: true,
        outputDir: path.join(tempRoot, 'tools-output/image-bg-removal/run-c'),
      },
      entries: [
        {
          model: 'products',
          recordId: 'prod-3',
          tenantId: 'tenant-2',
          originalKey: 'tenant-2/products/c.jpg',
          backupPath: '/tmp/a',
          processedPath: '/tmp/b',
          newKey: 'tenant-2/products/c.bg-removed.png',
          originalBytes: 1,
          processedBytes: 1,
          status: 'dry-run',
        },
      ],
      counts: {
        discovered: 1,
        processed: 1,
        skipped: 0,
        failed: 0,
        updated: 0,
      },
    });

    const report = await findImageManifests({
      env: 'develop',
      models: ['products'],
      roots: [tempRoot],
      includeNonUpdated: true,
    });

    expect(report.candidates).toHaveLength(1);
    expect(report.candidates[0]?.updatedEntries).toBe(0);
  });
});
