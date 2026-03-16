import {
  DynamoDBDocumentClient,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import type { ScanProgress, SourceReader } from './types';

export class DynamoSourceReader implements SourceReader {
  private readonly client: DynamoDBDocumentClient;

  constructor(client: DynamoDBClient) {
    this.client = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: false,
      },
    });
  }

  async scanTable(
    tableName: string,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<Record<string, unknown>[]> {
    const items: Record<string, unknown>[] = [];
    let exclusiveStartKey: Record<string, unknown> | undefined;
    let page = 0;

    do {
      page += 1;
      const response = await this.client.send(
        new ScanCommand({
          TableName: tableName,
          ExclusiveStartKey: exclusiveStartKey,
        })
      );

      const pageItems = (response.Items as Record<string, unknown>[]) ?? [];
      items.push(...pageItems);
      exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
      onProgress?.({
        page,
        itemCount: pageItems.length,
        totalSoFar: items.length,
        hasMore: !!exclusiveStartKey,
      });
    } while (exclusiveStartKey);

    return items;
  }
}
