import { PREFERRED_CATEGORY_NAMES } from './constants';
import type {
  CategoryRecord,
  EmployeeRecord,
  ProductRecord,
  SelectedSeedTargets,
  StoreRecord,
  TenantCatalogSnapshot,
} from './types';

const normalize = (value: string) => value.trim().toUpperCase();

const seedId = (tenantId: string, key: string) => `${tenantId}::discount-seed::${key}`;

const countProductsByCategory = (products: ProductRecord[]) => {
  const counts = new Map<string, number>();
  products.forEach((product) => {
    if (!product.productCategoryId) return;
    counts.set(product.productCategoryId, (counts.get(product.productCategoryId) || 0) + 1);
  });
  return counts;
};

const selectPreferredCategory = (
  categories: CategoryRecord[],
  products: ProductRecord[],
  preferredNames: readonly string[],
  predicate?: (product: ProductRecord) => boolean
) => {
  const filteredProducts = predicate ? products.filter(predicate) : products;
  const counts = countProductsByCategory(filteredProducts);
  const byId = new Map(categories.map((category) => [category.id, category]));

  for (const preferredName of preferredNames) {
    const match = categories.find((category) => normalize(category.name) === preferredName);
    if (match && counts.get(match.id)) {
      return match;
    }
  }

  const ranked = Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([id]) => byId.get(id))
    .filter((category): category is CategoryRecord => !!category);

  if (!ranked.length) {
    throw new Error(`Unable to find a category match for ${preferredNames.join(', ')}`);
  }

  return ranked[0];
};

const findProduct = (
  products: ProductRecord[],
  predicate: (product: ProductRecord) => boolean
) => {
  const match = products.find(predicate);
  if (!match) {
    throw new Error('Unable to select a product for discount seed');
  }
  return match;
};

const selectStore = (stores: StoreRecord[]) => {
  if (!stores.length) return null;
  return stores.find((store) => normalize(store.name) === 'BINCRAFTERS') || stores[0];
};

const selectEmployeeByRole = (employees: EmployeeRecord[], role: string) =>
  employees.find((employee) => employee.roles.some((candidate) => normalize(candidate) === normalize(role))) ||
  null;

export const buildStableSeedId = seedId;

export const selectSeedTargets = (snapshot: TenantCatalogSnapshot): SelectedSeedTargets => {
  const oilCategory = selectPreferredCategory(
    snapshot.categories,
    snapshot.products,
    PREFERRED_CATEGORY_NAMES.oil
  );
  const riceCategory = selectPreferredCategory(
    snapshot.categories,
    snapshot.products,
    PREFERRED_CATEGORY_NAMES.rice
  );
  const weightedCategory = selectPreferredCategory(
    snapshot.categories,
    snapshot.products,
    PREFERRED_CATEGORY_NAMES.weighted,
    (product) => normalize(product.unitOfMeasure) === 'LB'
  );

  const oilProducts = snapshot.products
    .filter((product) => product.productCategoryId === oilCategory.id)
    .sort((left, right) => left.name.localeCompare(right.name));
  const riceProducts = snapshot.products
    .filter((product) => product.productCategoryId === riceCategory.id)
    .sort((left, right) => left.name.localeCompare(right.name));
  const weightedProducts = snapshot.products
    .filter(
      (product) =>
        product.productCategoryId === weightedCategory.id &&
        normalize(product.unitOfMeasure) === 'LB'
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  if (oilProducts.length < 2) {
    throw new Error(`Expected at least two products in ${oilCategory.name} for exclusion testing`);
  }

  return {
    store: selectStore(snapshot.stores),
    stations: snapshot.stations,
    oilCategory,
    riceCategory,
    weightedCategory,
    excludedOilProduct:
      oilProducts.find((product) => normalize(product.name).includes('OLIVA')) || oilProducts[0],
    nonExcludedOilProduct:
      oilProducts.find((product) => !normalize(product.name).includes('OLIVA')) || oilProducts[1],
    riceProduct: findProduct(riceProducts, () => true),
    weightedProduct: findProduct(weightedProducts, () => true),
    ebtProduct:
      snapshot.products.find((product) => product.isEBTEligible === true && normalize(product.unitOfMeasure) === 'EA') ||
      snapshot.products[0],
    nonEbtProduct:
      snapshot.products.find(
        (product) =>
          product.isEBTEligible === false &&
          normalize(product.unitOfMeasure) === 'EA' &&
          product.id !== snapshot.products[0]?.id
      ) || snapshot.products[1] || snapshot.products[0],
    adminEmployee: selectEmployeeByRole(snapshot.employees, 'Admin'),
    salesEmployee: selectEmployeeByRole(snapshot.employees, 'Sales'),
  };
};
