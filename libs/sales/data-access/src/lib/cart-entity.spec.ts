import { CartItemMapper } from './cart-entity';

describe('CartItemMapper', () => {
  it('maps product data into a cart item with catalog discount fields', () => {
    const item = CartItemMapper.fromProduct(
      {
        id: 'product-1',
        name: 'Rice',
        price: 4.59,
        productCategoryId: 'category-1',
        unitOfMeasure: 'EA',
        barcode: '123',
        sku: 'RICE-1',
        isEBTEligible: true,
        discountable: false,
        minAllowedPrice: 3,
        maxManualDiscountPercent: 5,
        maxManualDiscountAmount: 1,
      },
      2
    );

    expect(item).toEqual({
      identifier: undefined,
      quantity: 2,
      product: {
        id: 'product-1',
        name: 'Rice',
        price: 4.59,
        categoryId: 'category-1',
        unitOfMeasure: 'EA',
        barcode: '123',
        sku: 'RICE-1',
        isEBTEligible: true,
        discountable: false,
        minAllowedPrice: 3,
        maxManualDiscountPercent: 5,
        maxManualDiscountAmount: 1,
        taxable: false,
      },
    });
  });

  it('defaults optional product fields for pricing-safe cart items', () => {
    const item = CartItemMapper.fromProduct(
      {
        id: 'product-2',
        name: 'Oil',
        price: 10,
        unitOfMeasure: 'EA',
      },
      1
    );

    expect(item.product.isEBTEligible).toBe(false);
    expect(item.product.discountable).toBe(true);
    expect(item.product.minAllowedPrice).toBeNull();
    expect(item.product.maxManualDiscountPercent).toBeNull();
    expect(item.product.maxManualDiscountAmount).toBeNull();
    expect(item.product.taxable).toBe(false);
  });
});
