export const BackOfficeSelectors = {
  reports: '3',
  endOfDay: '3-0',
  catalog: '5',
  products: '5-1',
  settings: '7',
  settingsGeneral: '7-0',
} as const;

export const ProductFormSelectors = {
  name: 'product-input-name',
  description: 'product-input-description',
  cost: 'product-input-cost',
  price: 'product-input-price',
  barcode: 'product-input-barcode',
  sku: 'product-input-sku',
  plu: 'product-input-plu',
  pictureUpload: 'product-picture-upload',
  save: 'product-save',
} as const;
