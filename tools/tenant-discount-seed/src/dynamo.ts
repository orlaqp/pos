import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';

const unmarshallNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
};

export const createDocumentClient = (region: string, profile: string) => {
  const client = new DynamoDBClient({
    region,
    credentials: fromIni({ profile }),
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });
};

export const scanByTenant = async <T extends Record<string, unknown>>(
  client: DynamoDBDocumentClient,
  tableName: string,
  tenantId: string
) => {
  const items: T[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await client.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: 'tenantId = :tenantId',
        ExpressionAttributeValues: {
          ':tenantId': tenantId,
        },
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    items.push(...((response.Items as T[]) || []));
    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return items;
};

export const upsertItems = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  incomingItems: Array<Record<string, unknown>>,
  existingItems: Array<Record<string, unknown>>
) => {
  const existingById = new Map(
    existingItems
      .filter((item): item is Record<string, unknown> & { id: string } => typeof item.id === 'string')
      .map((item) => [item.id, item])
  );

  for (const incoming of incomingItems) {
    const existing = typeof incoming.id === 'string' ? existingById.get(incoming.id) : undefined;
    const createdAt =
      typeof existing?.createdAt === 'string' ? existing.createdAt : new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const version = typeof existing?._version === 'number' ? existing._version + 1 : 1;
    const lastChangedAt =
      typeof existing?._lastChangedAt === 'number' ? Date.now() : Date.now();

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          ...incoming,
          createdAt,
          updatedAt,
          _version: version,
          _lastChangedAt: lastChangedAt,
          _deleted: false,
        },
      })
    );
  }
};

export const sortByName = <T extends { name?: string | null }>(items: T[]) =>
  [...items].sort((left, right) => (left.name || '').localeCompare(right.name || ''));

export const toNumber = (value: unknown) => unmarshallNumber(value);
