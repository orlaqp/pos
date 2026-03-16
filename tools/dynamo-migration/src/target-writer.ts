import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

import { assertWriteTargetTable } from './safety';
import type { ResolvedEnvironment, TargetWriter } from './types';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 100;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export class DynamoTargetWriter implements TargetWriter {
  private readonly client: DynamoDBDocumentClient;

  constructor(
    client: DynamoDBClient,
    private readonly sourceEnv: ResolvedEnvironment,
    private readonly targetEnv: ResolvedEnvironment
  ) {
    this.client = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: false,
      },
    });
  }

  async writeItem(tableName: string, item: Record<string, unknown>): Promise<void> {
    assertWriteTargetTable(tableName, this.sourceEnv, this.targetEnv);

    let attempt = 0;
    let lastError: unknown;

    while (attempt < MAX_RETRIES) {
      try {
        await this.client.send(
          new PutCommand({
            TableName: tableName,
            Item: item,
          })
        );
        return;
      } catch (error) {
        lastError = error;
        attempt += 1;
        if (attempt >= MAX_RETRIES) {
          break;
        }
        await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }
}
