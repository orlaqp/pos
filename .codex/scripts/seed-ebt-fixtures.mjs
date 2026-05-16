#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import https from 'https';

const repoRoot = '/Users/orlando/dev/pos';
const appRoot = path.join(repoRoot, 'apps/mobile-ui');
const localEnvInfoPath = path.join(appRoot, 'amplify/.config/local-env-info.json');
const awsExportsPath = path.join(appRoot, 'src/aws-exports.js');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

const localEnvInfo = JSON.parse(fs.readFileSync(localEnvInfoPath, 'utf8'));
if (localEnvInfo.envName !== 'ebtdev') {
  fail(`ABORT: not on ebtdev (current env: ${localEnvInfo.envName})`);
}

function loadAwsExports(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const transformed = raw.replace(/export default awsmobile;?/, 'module.exports = awsmobile;');
  const script = new vm.Script(transformed, { filename: 'aws-exports.js' });
  const context = vm.createContext({ module: { exports: {} }, exports: {}, console });
  script.runInContext(context);
  return context.module.exports;
}

const awsConfig = loadAwsExports(awsExportsPath);
const endpoint = awsConfig.aws_appsync_graphqlEndpoint;
const apiKey = awsConfig.aws_appsync_apiKey;

if (!endpoint || !apiKey) {
  fail('Missing GraphQL endpoint or API key in aws-exports.js');
}

async function graphql(query, variables = {}) {
  const body = JSON.stringify({ query, variables });
  const url = new URL(endpoint);

  const payload = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-api-key': apiKey,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join('; '));
  }
  return payload.data;
}

const Q = {
  listCategoriesByName: `query ListCategories($filter: ModelCategoryFilterInput) { listCategories(filter: $filter, limit: 1) { items { id name } } }`,
  createCategory: `mutation CreateCategory($input: CreateCategoryInput!) { createCategory(input: $input) { id name } }`,

  listStoresByName: `query ListStores($filter: ModelStoreFilterInput) { listStores(filter: $filter, limit: 1) { items { id name } } }`,
  createStore: `mutation CreateStore($input: CreateStoreInput!) { createStore(input: $input) { id name } }`,

  listEmployeesByCode: `query ListEmployees($filter: ModelEmployeeFilterInput) { listEmployees(filter: $filter, limit: 1) { items { id code roles active } } }`,
  createEmployee: `mutation CreateEmployee($input: CreateEmployeeInput!) { createEmployee(input: $input) { id code } }`,
  updateEmployee: `mutation UpdateEmployee($input: UpdateEmployeeInput!) { updateEmployee(input: $input) { id code roles active } }`,

  listStationsByAlias: `query ListStations($filter: ModelStationFilterInput) { listStations(filter: $filter, limit: 1) { items { id alias } } }`,
  createStation: `mutation CreateStation($input: CreateStationInput!) { createStation(input: $input) { id alias } }`,

  listPrintersByAlias: `query ListPrinters($filter: ModelPrinterFilterInput) { listPrinters(filter: $filter, limit: 1) { items { id alias } } }`,
  createPrinter: `mutation CreatePrinter($input: CreatePrinterInput!) { createPrinter(input: $input) { id alias } }`,

  listProducts: `query ListProducts($nextToken: String) { listProducts(limit: 500, nextToken: $nextToken) { items { id name isEBTEligible productCategoryId } nextToken } }`,
  createProduct: `mutation CreateProduct($input: CreateProductInput!) { createProduct(input: $input) { id name isEBTEligible } }`,
  updateProduct: `mutation UpdateProduct($input: UpdateProductInput!) { updateProduct(input: $input) { id name isEBTEligible productCategoryId } }`,
};

async function findOne(listQuery, field, value) {
  const data = await graphql(listQuery, {
    filter: { [field]: { eq: value } },
  });
  const root = Object.values(data)[0];
  return root?.items?.[0] || null;
}

async function ensureStore() {
  const name = 'EBT Dev Store';
  const existing = await findOne(Q.listStoresByName, 'name', name);
  if (existing) return { action: 'exists', entity: existing };

  const input = {
    name,
    address: '100 EBT Ave',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
    country: 'US',
    phone: '555-0100',
    email: 'ebt-dev-store@example.com',
    disclaimer: 'EBT dev fixtures only',
  };

  const data = await graphql(Q.createStore, { input });
  return { action: 'created', entity: data.createStore };
}

async function ensureCategory(name, code, color) {
  const existing = await findOne(Q.listCategoriesByName, 'name', name);
  if (existing) return { action: 'exists', entity: existing };

  const input = {
    name,
    description: 'EBT fixture category',
    code,
    color,
  };
  const data = await graphql(Q.createCategory, { input });
  return { action: 'created', entity: data.createCategory };
}

async function ensureEmployee() {
  const code = 'EBTDEV01';
  const expectedRoles = ['Sales', 'Payments', 'Admin'];
  const existing = await findOne(Q.listEmployeesByCode, 'code', code);
  if (existing) {
    const roles = (existing.roles || []).filter(Boolean);
    const hasAllRoles = expectedRoles.every((role) => roles.includes(role));
    if (!hasAllRoles || existing.active !== true) {
      const data = await graphql(Q.updateEmployee, {
        input: {
          id: existing.id,
          roles: expectedRoles,
          active: true,
        },
      });
      return { action: 'updated roles/active', entity: data.updateEmployee };
    }
    return { action: 'exists', entity: existing };
  }

  const input = {
    code,
    firstName: 'EBT',
    lastName: 'Cashier',
    pin: '1234',
    roles: expectedRoles,
    active: true,
    email: 'ebt-cashier@example.com',
    phone: '555-0101',
  };

  const data = await graphql(Q.createEmployee, { input });
  return { action: 'created', entity: data.createEmployee };
}

async function ensureStation() {
  const alias = 'EBT DEV STATION';
  const existing = await findOne(Q.listStationsByAlias, 'alias', alias);
  if (existing) return { action: 'exists', entity: existing };

  const input = {
    alias,
    deviceId: 'ebt-dev-station-001',
  };

  const data = await graphql(Q.createStation, { input });
  return { action: 'created', entity: data.createStation };
}

async function ensurePrinter() {
  const alias = 'EBT DEV PRINTER';
  const existing = await findOne(Q.listPrintersByAlias, 'alias', alias);
  if (existing) return { action: 'exists', entity: existing };

  const input = {
    deviceId: 'ebt-dev-printer-001',
    identifier: 'ebt-dev-printer-001',
    interfaceType: 'LAN',
    ip: '192.168.1.250',
    model: 'Simulator',
    alias,
  };

  const data = await graphql(Q.createPrinter, { input });
  return { action: 'created', entity: data.createPrinter };
}

async function ensureProduct(name, isEBTEligible, price, productCategoryId) {
  let nextToken = null;
  let existing = [];
  do {
    const data = await graphql(Q.listProducts, { nextToken });
    const page = data.listProducts;
    const pageMatches = page?.items?.filter((item) => item?.name === name) || [];
    existing = existing.concat(pageMatches);
    nextToken = page?.nextToken || null;
  } while (nextToken);

  if (existing.length) {
    let updates = 0;
    for (const item of existing) {
      if (item.productCategoryId !== productCategoryId) {
        await graphql(Q.updateProduct, {
          input: {
            id: item.id,
            productCategoryId,
          },
        });
        updates += 1;
      }
    }

    const first = existing[0];
    if (updates) {
      return { action: `updated category on ${updates}/${existing.length} record(s)`, entity: first };
    }
    if (existing.length > 1) {
      return { action: `exists (${existing.length} records)`, entity: first };
    }
    return { action: 'exists', entity: first };
  }

  const input = {
    name,
    description: 'EBT fixture product',
    price,
    quantity: 100,
    unitOfMeasure: 'EA',
    trackStock: true,
    isActive: true,
    isEBTEligible,
    productCategoryId,
    barcode: `FIX-${name.replace(/\s+/g, '-').toUpperCase()}`,
    sku: `FIX-${name.replace(/\s+/g, '-').toUpperCase()}`,
  };

  const data = await graphql(Q.createProduct, { input });
  return { action: 'created', entity: data.createProduct };
}

async function main() {
  const results = [];
  const ebtCategory = await ensureCategory('EBT Eligible', 'EBT', '#22C55E');
  const regularCategory = await ensureCategory('Regular Items', 'REG', '#3B82F6');
  results.push(['Category', ebtCategory]);
  results.push(['Category', regularCategory]);

  results.push(['Store', await ensureStore()]);
  results.push(['Employee', await ensureEmployee()]);
  results.push(['Station', await ensureStation()]);
  results.push(['Printer', await ensurePrinter()]);

  results.push(['Product', await ensureProduct('EBT Apple Fixture', true, 2.49, ebtCategory.entity.id)]);
  results.push(['Product', await ensureProduct('EBT Bread Fixture', true, 3.99, ebtCategory.entity.id)]);
  results.push(['Product', await ensureProduct('NON-EBT Shampoo Fixture', false, 6.5, regularCategory.entity.id)]);
  results.push(['Product', await ensureProduct('NON-EBT Soap Fixture', false, 4.25, regularCategory.entity.id)]);

  console.log('Seed results (ebtdev):');
  for (const [kind, result] of results) {
    const id = result.entity?.id || 'n/a';
    const label = result.entity?.name || result.entity?.alias || result.entity?.code || id;
    console.log(`- ${kind}: ${result.action} -> ${label} (${id})`);
  }
}

main().catch((error) => {
  fail(error.message || String(error));
});
