import { TABLES } from './constants';
import { scanByTenant, sortByName, toNumber } from './dynamo';
import type {
  CategoryRecord,
  EmployeeRecord,
  ProductRecord,
  StationRecord,
  StoreRecord,
  TenantCatalogSnapshot,
} from './types';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { ResolvedEnvironment } from '../../dynamo-migration/src/types';

const requiredTable = (env: ResolvedEnvironment, modelName: string) => {
  const table = env.tables[modelName];
  if (!table) {
    throw new Error(`Unable to resolve ${modelName} table in ${env.envName}`);
  }
  return table.physicalTableName;
};

const mapStore = (item: Record<string, unknown>): StoreRecord => ({
  id: String(item.id),
  tenantId: String(item.tenantId),
  name: String(item.name),
  timezone: typeof item.timezone === 'string' ? item.timezone : null,
  createdAt: typeof item.createdAt === 'string' ? item.createdAt : null,
});

const mapStation = (item: Record<string, unknown>): StationRecord => ({
  id: String(item.id),
  tenantId: String(item.tenantId),
  name: String(item.name),
});

const mapEmployee = (item: Record<string, unknown>): EmployeeRecord => ({
  id: String(item.id),
  tenantId: String(item.tenantId),
  firstName: String(item.firstName),
  lastName: typeof item.lastName === 'string' ? item.lastName : null,
  email: typeof item.email === 'string' ? item.email : null,
  roles: Array.isArray(item.roles) ? item.roles.filter((role): role is string => typeof role === 'string') : [],
});

const sortEmployees = (employees: EmployeeRecord[]) =>
  [...employees].sort((left, right) =>
    `${left.firstName} ${left.lastName || ''}`.trim().localeCompare(
      `${right.firstName} ${right.lastName || ''}`.trim()
    )
  );

const mapCategory = (item: Record<string, unknown>): CategoryRecord => ({
  id: String(item.id),
  tenantId: String(item.tenantId),
  name: String(item.name),
});

const mapProduct = (item: Record<string, unknown>): ProductRecord => ({
  id: String(item.id),
  tenantId: String(item.tenantId),
  name: String(item.name),
  price: toNumber(item.price),
  unitOfMeasure: String(item.unitOfMeasure || ''),
  productCategoryId:
    typeof item.productCategoryId === 'string' ? item.productCategoryId : null,
  isEBTEligible: typeof item.isEBTEligible === 'boolean' ? item.isEBTEligible : null,
  discountable: typeof item.discountable === 'boolean' ? item.discountable : null,
});

export const loadTenantCatalogSnapshot = async (
  client: DynamoDBDocumentClient,
  env: ResolvedEnvironment,
  tenantId: string
): Promise<TenantCatalogSnapshot> => {
  const stores = sortByName(
    (await scanByTenant<Record<string, unknown>>(client, requiredTable(env, TABLES.store), tenantId)).map(mapStore)
  );
  const stations = sortByName(
    (await scanByTenant<Record<string, unknown>>(client, requiredTable(env, TABLES.station), tenantId)).map(
      mapStation
    )
  );
  const employees = sortEmployees(
    (await scanByTenant<Record<string, unknown>>(client, requiredTable(env, TABLES.employee), tenantId)).map(
      mapEmployee
    )
  );
  const categories = sortByName(
    (await scanByTenant<Record<string, unknown>>(client, requiredTable(env, TABLES.category), tenantId)).map(
      mapCategory
    )
  );
  const products = sortByName(
    (await scanByTenant<Record<string, unknown>>(client, requiredTable(env, TABLES.product), tenantId)).map(
      mapProduct
    )
  );

  return {
    tenantId,
    stores,
    stations,
    employees,
    categories,
    products,
    discountDefinitions: await scanByTenant<Record<string, unknown>>(
      client,
      requiredTable(env, TABLES.discountDefinition),
      tenantId
    ),
    employeeDiscountPolicies: await scanByTenant<Record<string, unknown>>(
      client,
      requiredTable(env, TABLES.employeeDiscountPolicy),
      tenantId
    ),
  };
};
