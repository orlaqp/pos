import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { randomUUID } from 'crypto';

import { resolveEnvironment } from './dynamo-migration/src/amplify-env';
import { resolveStorageEnvironment } from './s3-asset-migration/src/asset-storage-env';

type ModelName = 'Category' | 'UnitOfMeasure' | 'Product';

type Report = {
  model: ModelName | 'Assets';
  source: number;
  targetExisting: number;
  reused: number;
  planned: number;
  written: number;
  skipped: number;
  failed: number;
};

type Options = {
  env: string;
  profile: string;
  sourceTenantId: string;
  targetTenantId: string;
  apply: boolean;
  ignoreMissingAssets: boolean;
};

const REQUIRED_ARGS =
  'Missing required args: --source-tenant-id --target-tenant-id. Optional: --env prod --profile pos --apply --ignore-missing-assets';

const parseBoolean = (value: string | undefined) => value === 'true' || value === '1';

const parseArgs = (argv: string[]): Options => {
  const args = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args.set(key, 'true');
      continue;
    }

    args.set(key, next);
    index += 1;
  }

  const sourceTenantId = args.get('source-tenant-id');
  const targetTenantId = args.get('target-tenant-id');

  if (!sourceTenantId || !targetTenantId) {
    throw new Error(REQUIRED_ARGS);
  }

  if (sourceTenantId === targetTenantId) {
    throw new Error('Source and target tenant ids must be different');
  }

  return {
    env: args.get('env') ?? 'prod',
    profile: args.get('profile') ?? 'pos',
    sourceTenantId,
    targetTenantId,
    apply: parseBoolean(args.get('apply')),
    ignoreMissingAssets: parseBoolean(args.get('ignore-missing-assets')),
  };
};

const createDocumentClient = (profile: string, region = 'us-east-1') => {
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

const scanByTenant = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  tenantId: string
) => {
  const items: Record<string, unknown>[] = [];
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

    items.push(...((response.Items as Record<string, unknown>[] | undefined) ?? []));
    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return items;
};

const keyText = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const categoryKey = (item: Record<string, unknown>) =>
  [keyText(item.name), keyText(item.code)].join('|');

const unitKey = (item: Record<string, unknown>) => keyText(item.name);

const productKeyCandidates = (item: Record<string, unknown>) =>
  [
    ['barcode', keyText(item.barcode)],
    ['sku', keyText(item.sku)],
    ['plu', keyText(item.plu)],
    ['name', keyText(item.name)],
  ].filter((candidate): candidate is [string, string] => candidate[1].length > 0);

const buildProductIndex = (items: Record<string, unknown>[]) => {
  const index = new Set<string>();

  for (const item of items) {
    for (const [field, value] of productKeyCandidates(item)) {
      index.add(`${field}:${value}`);
    }
  }

  return index;
};

const hasMatchingProduct = (index: Set<string>, item: Record<string, unknown>) =>
  productKeyCandidates(item).some(([field, value]) => index.has(`${field}:${value}`));

const nowFields = () => {
  const now = new Date().toISOString();

  return {
    createdAt: now,
    updatedAt: now,
    _version: 1,
    _lastChangedAt: Date.now(),
    _deleted: false,
  };
};

const cleanCopy = (
  item: Record<string, unknown>,
  tenantId: string,
  id: string
): Record<string, unknown> => {
  const { __typename: _typename, ...rest } = item;

  return {
    ...rest,
    ...nowFields(),
    id,
    tenantId,
  };
};

const normalizeAssetKey = (value: unknown) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const trimmed = value.trim().replace(/^\/+/, '');
  if (
    trimmed.startsWith('public/') ||
    trimmed.startsWith('protected/') ||
    trimmed.startsWith('private/')
  ) {
    return trimmed;
  }

  return `public/${trimmed}`;
};

const extractAssetSuffix = (key: string, kind: 'products' | 'categories') => {
  const matcher = new RegExp(`(?:^|/)${kind}/(.+)$`);
  const match = key.match(matcher);
  if (match?.[1]) return match[1];

  return key.split('/').pop() ?? '';
};

const targetAssetPath = (
  sourcePicture: unknown,
  targetTenantId: string,
  kind: 'products' | 'categories'
) => {
  const sourceKey = normalizeAssetKey(sourcePicture);
  if (!sourceKey) return { sourceKey: null, targetPicture: sourcePicture };

  const suffix = extractAssetSuffix(sourceKey, kind);
  if (!suffix) return { sourceKey, targetPicture: sourcePicture };

  return {
    sourceKey,
    targetPicture: `${targetTenantId}/${kind}/${suffix}`,
  };
};

const encodeCopySource = (bucketName: string, key: string) =>
  `${bucketName}/${key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

const requiredTable = (
  tables: Record<string, { physicalTableName: string }>,
  modelName: ModelName
) => {
  const table = tables[modelName]?.physicalTableName;
  if (!table) {
    throw new Error(`Unable to resolve ${modelName} table`);
  }
  return table;
};

const putNewItem = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  item: Record<string, unknown>
) => {
  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)',
    })
  );
};

const printReport = (reports: Report[]) => {
  for (const report of reports) {
    console.log(
      `${report.model}: source=${report.source} targetExisting=${report.targetExisting} reused=${report.reused} planned=${report.planned} written=${report.written} skipped=${report.skipped} failed=${report.failed}`
    );
  }
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const cf = new CloudFormationClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.profile }),
  });
  const env = await resolveEnvironment(cf, options.profile, options.env);
  const storage = await resolveStorageEnvironment(cf, options.profile, options.env);
  const dynamo = createDocumentClient(options.profile, env.region);
  const s3 = new S3Client({
    region: storage.region,
    credentials: fromIni({ profile: options.profile }),
  });

  const categoryTable = requiredTable(env.tables as never, 'Category');
  const unitTable = requiredTable(env.tables as never, 'UnitOfMeasure');
  const productTable = requiredTable(env.tables as never, 'Product');
  const reports: Report[] = [];

  console.log(`Environment: ${env.envName}`);
  console.log(`Stack: ${env.stackName}`);
  console.log(`Profile: ${options.profile}`);
  console.log(`Bucket: ${storage.bucketName}`);
  console.log(`Source tenant id: ${options.sourceTenantId}`);
  console.log(`Target tenant id: ${options.targetTenantId}`);
  console.log(options.apply ? 'Mode: APPLY' : 'Mode: DRY RUN');

  const [sourceCategories, targetCategories] = await Promise.all([
    scanByTenant(dynamo, categoryTable, options.sourceTenantId),
    scanByTenant(dynamo, categoryTable, options.targetTenantId),
  ]);
  const targetCategoryByKey = new Map(
    targetCategories.map((item) => [categoryKey(item), String(item.id)])
  );
  const categoryIdMap = new Map<string, string>();
  const assetCopies: Array<{ sourceKey: string; targetKey: string }> = [];
  const categoryReport: Report = {
    model: 'Category',
    source: sourceCategories.length,
    targetExisting: targetCategories.length,
    reused: 0,
    planned: 0,
    written: 0,
    skipped: 0,
    failed: 0,
  };

  for (const category of sourceCategories) {
    const sourceId = typeof category.id === 'string' ? category.id : null;
    if (!sourceId) {
      categoryReport.skipped += 1;
      continue;
    }

    const existingId = targetCategoryByKey.get(categoryKey(category));
    if (existingId) {
      categoryIdMap.set(sourceId, existingId);
      categoryReport.reused += 1;
      continue;
    }

    const newId = randomUUID();
    categoryIdMap.set(sourceId, newId);
    const { sourceKey, targetPicture } = targetAssetPath(
      category.picture,
      options.targetTenantId,
      'categories'
    );
    const copy = {
      ...cleanCopy(category, options.targetTenantId, newId),
      picture: targetPicture,
      discountable:
        typeof category.discountable === 'boolean' ? category.discountable : true,
      discountPolicyMode:
        typeof category.discountPolicyMode === 'string' &&
        category.discountPolicyMode.trim().length > 0
          ? category.discountPolicyMode
          : 'DEFAULT',
    };

    if (sourceKey && typeof targetPicture === 'string') {
      assetCopies.push({
        sourceKey,
        targetKey: `public/${targetPicture}`,
      });
    }

    categoryReport.planned += 1;
    if (options.apply) {
      try {
        await putNewItem(dynamo, categoryTable, copy);
        categoryReport.written += 1;
      } catch (error) {
        categoryReport.failed += 1;
        console.error(`Category ${sourceId}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  reports.push(categoryReport);

  const [sourceUnits, targetUnits] = await Promise.all([
    scanByTenant(dynamo, unitTable, options.sourceTenantId),
    scanByTenant(dynamo, unitTable, options.targetTenantId),
  ]);
  const targetUnitKeys = new Set(targetUnits.map(unitKey));
  const unitReport: Report = {
    model: 'UnitOfMeasure',
    source: sourceUnits.length,
    targetExisting: targetUnits.length,
    reused: 0,
    planned: 0,
    written: 0,
    skipped: 0,
    failed: 0,
  };

  for (const unit of sourceUnits) {
    const sourceId = typeof unit.id === 'string' ? unit.id : null;
    if (!sourceId) {
      unitReport.skipped += 1;
      continue;
    }

    const key = unitKey(unit);
    if (targetUnitKeys.has(key)) {
      unitReport.reused += 1;
      continue;
    }

    const copy = cleanCopy(unit, options.targetTenantId, randomUUID());
    unitReport.planned += 1;
    if (options.apply) {
      try {
        await putNewItem(dynamo, unitTable, copy);
        unitReport.written += 1;
        targetUnitKeys.add(key);
      } catch (error) {
        unitReport.failed += 1;
        console.error(`UnitOfMeasure ${sourceId}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  reports.push(unitReport);

  const [sourceProducts, targetProducts] = await Promise.all([
    scanByTenant(dynamo, productTable, options.sourceTenantId),
    scanByTenant(dynamo, productTable, options.targetTenantId),
  ]);
  const targetProductIndex = buildProductIndex(targetProducts);
  const productReport: Report = {
    model: 'Product',
    source: sourceProducts.length,
    targetExisting: targetProducts.length,
    reused: 0,
    planned: 0,
    written: 0,
    skipped: 0,
    failed: 0,
  };

  for (const product of sourceProducts) {
    const sourceId = typeof product.id === 'string' ? product.id : null;
    if (!sourceId) {
      productReport.skipped += 1;
      continue;
    }

    if (hasMatchingProduct(targetProductIndex, product)) {
      productReport.reused += 1;
      continue;
    }

    const { sourceKey, targetPicture } = targetAssetPath(
      product.picture,
      options.targetTenantId,
      'products'
    );
    const sourceCategoryId =
      typeof product.productCategoryId === 'string' ? product.productCategoryId : null;
    const copy = {
      ...cleanCopy(product, options.targetTenantId, randomUUID()),
      picture: targetPicture,
      productCategoryId: sourceCategoryId
        ? categoryIdMap.get(sourceCategoryId) ?? null
        : product.productCategoryId,
      discountable:
        typeof product.discountable === 'boolean' ? product.discountable : true,
    };

    if (sourceKey && typeof targetPicture === 'string') {
      assetCopies.push({
        sourceKey,
        targetKey: `public/${targetPicture}`,
      });
    }

    productReport.planned += 1;
    if (options.apply) {
      try {
        await putNewItem(dynamo, productTable, copy);
        productReport.written += 1;
        for (const [field, value] of productKeyCandidates(product)) {
          targetProductIndex.add(`${field}:${value}`);
        }
      } catch (error) {
        productReport.failed += 1;
        console.error(`Product ${sourceId}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  reports.push(productReport);

  const uniqueAssetCopies = Array.from(
    new Map(assetCopies.map((copy) => [`${copy.sourceKey}->${copy.targetKey}`, copy])).values()
  ).filter((copy) => copy.sourceKey !== copy.targetKey);
  const assetReport: Report = {
    model: 'Assets',
    source: uniqueAssetCopies.length,
    targetExisting: 0,
    reused: 0,
    planned: uniqueAssetCopies.length,
    written: 0,
    skipped: 0,
    failed: 0,
  };

  if (options.apply) {
    for (const copy of uniqueAssetCopies) {
      try {
        await s3.send(
          new CopyObjectCommand({
            Bucket: storage.bucketName,
            Key: copy.targetKey,
            CopySource: encodeCopySource(storage.bucketName, copy.sourceKey),
            MetadataDirective: 'COPY',
          })
        );
        assetReport.written += 1;
      } catch (error) {
        if (options.ignoreMissingAssets) {
          assetReport.skipped += 1;
          continue;
        }

        assetReport.failed += 1;
        console.error(
          `Asset ${copy.sourceKey} -> ${copy.targetKey}: ${
            error instanceof Error ? error.message : error
          }`
        );
      }
    }
  }
  reports.push(assetReport);

  printReport(reports);

  const failures = reports.reduce((total, report) => total + report.failed, 0);
  if (failures > 0) {
    throw new Error(`Catalog copy completed with ${failures} failure(s)`);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
