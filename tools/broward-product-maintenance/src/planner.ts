import {
  BARCODE_TRIM_PREFIX_LENGTH,
  BARCODE_TRIM_THRESHOLD,
  MaintenanceSummary,
  ProductRecord,
  ProductUpdatePlan,
  TARGET_QUANTITY,
} from './types';

const getString = (value: unknown) => (typeof value === 'string' ? value : undefined);

const getNumber = (value: unknown) => (typeof value === 'number' ? value : undefined);

export const buildMaintenancePlan = (
  products: ProductRecord[],
  tenantId: string
): ProductUpdatePlan[] =>
  products
    .filter((product) => product.tenantId === tenantId && typeof product.id === 'string')
    .map((product) => {
      const barcode = getString(product.barcode);
      const nextBarcode =
        barcode && barcode.length > BARCODE_TRIM_THRESHOLD
          ? barcode.slice(BARCODE_TRIM_PREFIX_LENGTH)
          : undefined;

      return {
        id: product.id as string,
        tenantId,
        currentQuantity: product.quantity,
        nextQuantity: TARGET_QUANTITY,
        currentBarcode: barcode,
        nextBarcode,
        currentVersion: getNumber(product._version),
      };
    });

export const summarizePlan = (plan: ProductUpdatePlan[]): MaintenanceSummary => ({
  totalProducts: plan.length,
  quantityChanges: plan.filter((item) => item.currentQuantity !== item.nextQuantity).length,
  barcodeChanges: plan.filter((item) => typeof item.nextBarcode === 'string').length,
});

export const getBarcodeSamples = (
  plan: ProductUpdatePlan[],
  limit = 10
) =>
  plan
    .filter(
      (item): item is ProductUpdatePlan & { currentBarcode: string; nextBarcode: string } =>
        typeof item.currentBarcode === 'string' && typeof item.nextBarcode === 'string'
    )
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      before: item.currentBarcode,
      after: item.nextBarcode,
    }));
