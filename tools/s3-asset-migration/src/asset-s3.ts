import {
  CopyObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  type S3Client,
} from '@aws-sdk/client-s3';

import { assertWriteTargetBucket } from './asset-safety';
import type {
  AssetPrefix,
  ListedObject,
  Logger,
  StorageEnvironment,
} from './asset-types';

const encodeCopySource = (bucketName: string, key: string) =>
  `${bucketName}/${key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

export class AssetSourceReader {
  constructor(private readonly client: S3Client) {}

  async listPrefix(
    bucketName: string,
    prefix: AssetPrefix,
    onPage?: (page: number, objectCount: number, totalObjects: number, totalBytes: number, hasMore: boolean) => void
  ): Promise<ListedObject[]> {
    const objects: ListedObject[] = [];
    let continuationToken: string | undefined;
    let page = 0;

    do {
      page += 1;
      const input: ListObjectsV2CommandInput = {
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      };
      const response = await this.client.send(new ListObjectsV2Command(input));
      const pageObjects = (response.Contents ?? [])
        .filter((item): item is { Key: string; Size?: number } => !!item.Key)
        .map((item) => ({
          key: item.Key,
          size: item.Size ?? 0,
        }));

      objects.push(...pageObjects);
      continuationToken = response.NextContinuationToken;
      onPage?.(
        page,
        pageObjects.length,
        objects.length,
        objects.reduce((total, item) => total + item.size, 0),
        !!continuationToken
      );
    } while (continuationToken);

    return objects;
  }
}

export class AssetTargetWriter {
  constructor(
    private readonly client: S3Client,
    private readonly sourceEnv: StorageEnvironment,
    private readonly targetEnv: StorageEnvironment
  ) {}

  async copyObject(key: string): Promise<void> {
    assertWriteTargetBucket(this.targetEnv.bucketName, this.sourceEnv, this.targetEnv);

    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.targetEnv.bucketName,
        Key: key,
        CopySource: encodeCopySource(this.sourceEnv.bucketName, key),
        MetadataDirective: 'COPY',
      })
    );
  }
}

export const createDefaultLogger = (): Logger => ({
  info: (message: string) => console.log(message),
  error: (message: string) => console.error(message),
});
