import type { ImageMigrationOptions, ImageMigrationReport } from './image-types';

export const createInitialImageReport = (
  options: ImageMigrationOptions,
  bucketName: string,
  outputDir: string,
  manifestPath: string
): ImageMigrationReport => ({
  preflight: {
    env: options.env,
    profile: options.profile,
    bucket: bucketName,
    tenantId: options.tenantId ?? null,
    models: [...options.models],
    dryRun: options.dryRun,
    limit: options.limit ?? null,
    outputDir,
  },
  entries: [],
  counts: {
    discovered: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    updated: 0,
  },
  manifestPath,
});

export const logImagePreflight = (report: ImageMigrationReport) => {
  console.log(
    [
      '[image-bg-removal] preflight',
      `env=${report.preflight.env}`,
      `profile=${report.preflight.profile}`,
      `bucket=${report.preflight.bucket}`,
      `tenant=${report.preflight.tenantId ?? 'all'}`,
      `models=${report.preflight.models.join(',')}`,
      `dryRun=${String(report.preflight.dryRun)}`,
      `limit=${report.preflight.limit ?? 'none'}`,
      `outputDir=${report.preflight.outputDir}`,
    ].join(' ')
  );
};

export const logImageReport = (report: ImageMigrationReport) => {
  console.log(
    [
      '[image-bg-removal] summary',
      `discovered=${report.counts.discovered}`,
      `processed=${report.counts.processed}`,
      `updated=${report.counts.updated}`,
      `skipped=${report.counts.skipped}`,
      `failed=${report.counts.failed}`,
      `manifest=${report.manifestPath}`,
    ].join(' ')
  );
};
