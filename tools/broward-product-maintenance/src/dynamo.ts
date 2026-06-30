import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';

import { ProductRecord, ProductUpdatePlan } from './types';

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

export const scanProductsByTenant = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  tenantId: string
) => {
  const items: ProductRecord[] = [];
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

    items.push(...((response.Items as ProductRecord[] | undefined) ?? []));
    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return items;
};

export const applyProductUpdate = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  item: ProductUpdatePlan,
  now = new Date()
) => {
  const nextVersion = typeof item.currentVersion === 'number' ? item.currentVersion + 1 : 1;
  const names: Record<string, string> = {
    '#quantity': 'quantity',
    '#updatedAt': 'updatedAt',
    '#lastChangedAt': '_lastChangedAt',
    '#version': '_version',
    '#tenantId': 'tenantId',
  };
  const values: Record<string, unknown> = {
    ':quantity': item.nextQuantity,
    ':updatedAt': now.toISOString(),
    ':lastChangedAt': now.getTime(),
    ':version': nextVersion,
    ':tenantId': item.tenantId,
  };
  const assignments = [
    '#quantity = :quantity',
    '#updatedAt = :updatedAt',
    '#lastChangedAt = :lastChangedAt',
    '#version = :version',
  ];

  if (typeof item.nextBarcode === 'string') {
    names['#barcode'] = 'barcode';
    values[':barcode'] = item.nextBarcode;
    assignments.push('#barcode = :barcode');
  }

  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id: item.id },
      UpdateExpression: `SET ${assignments.join(', ')}`,
      ConditionExpression: 'attribute_exists(id) AND #tenantId = :tenantId',
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
};

export const applyProductUpdates = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  plan: ProductUpdatePlan[]
) => {
  for (const item of plan) {
    await applyProductUpdate(client, tableName, item);
  }
};
