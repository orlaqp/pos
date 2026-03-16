export const DEFAULT_TARGET_ENV = 'ebtdev';
export const DEFAULT_PROFILE = 'pos';
export const DEFAULT_QA_OUTPUT_DIR = 'tools/tenant-discount-seed/out';
export const SUNDAY_ONLY = ['SUN'];

export const TABLES = {
  store: 'Store',
  station: 'Station',
  employee: 'Employee',
  category: 'Category',
  product: 'Product',
  discountDefinition: 'DiscountDefinition',
  employeeDiscountPolicy: 'EmployeeDiscountPolicy',
} as const;

export const PREFERRED_CATEGORY_NAMES = {
  oil: ['ACEITES'],
  rice: ['ARROZ', 'GRANOS'],
  weighted: ['RES', 'CERDO', 'PESCADOS'],
} as const;
