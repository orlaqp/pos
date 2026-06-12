export const DEFAULT_TENANT_ID = 'f4287488-b0b1-709f-86f8-868782693a83';
export const DEFAULT_TARGET_ENV = 'prod';
export const DEFAULT_PROFILE = 'pos';
export const TARGET_QUANTITY = 1000;
export const BARCODE_TRIM_THRESHOLD = 14;
export const BARCODE_TRIM_PREFIX_LENGTH = 4;

export type ProductRecord = {
  id?: unknown;
  tenantId?: unknown;
  quantity?: unknown;
  barcode?: unknown;
  _version?: unknown;
};

export type ProductUpdatePlan = {
  id: string;
  tenantId: string;
  currentQuantity: unknown;
  nextQuantity: number;
  currentBarcode?: string;
  nextBarcode?: string;
  currentVersion?: number;
};

export type MaintenanceSummary = {
  totalProducts: number;
  quantityChanges: number;
  barcodeChanges: number;
};

export type CliOptions = {
  tenantId: string;
  targetEnv: string;
  profile: string;
  apply: boolean;
};

export type BarcodeSample = {
  id: string;
  before: string;
  after: string;
};

