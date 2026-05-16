import { createModelSpecs } from './transforms';

describe('transforms', () => {
  it('applies tenant ids and defaults', () => {
    const specs = createModelSpecs(['Store', 'Category', 'Product', 'GlobalSettings']);
    const tenantId = 'tenant-123';

    const store = specs[0].transform({ id: 'store-1', name: 'Main' }, tenantId);
    const category = specs[1].transform(
      { id: 'cat-1', name: 'Beer', picture: 'categories/beer.jpg' },
      tenantId
    );
    const product = specs[2].transform(
      { id: 'prod-1', name: 'IPA', picture: 'products/ipa.jpg' },
      tenantId
    );
    const settings = specs[3].transform({ id: 'gs-1' }, tenantId);

    expect(store).toEqual({
      status: 'ok',
      item: expect.objectContaining({
        id: 'store-1',
        tenantId,
        timezone: 'America/New_York',
      }),
    });
    expect(category).toEqual({
      status: 'ok',
      item: expect.objectContaining({
        id: 'cat-1',
        tenantId,
        picture: `${tenantId}/categories/beer.jpg`,
        discountable: true,
        discountPolicyMode: 'DEFAULT',
      }),
    });
    expect(product).toEqual({
      status: 'ok',
      item: expect.objectContaining({
        id: 'prod-1',
        tenantId,
        picture: `${tenantId}/products/ipa.jpg`,
        discountable: true,
      }),
    });
    expect(settings).toEqual({
      status: 'ok',
      item: expect.objectContaining({
        id: 'gs-1',
        tenantId,
        timezone: 'America/New_York',
      }),
    });
  });

  it('backfills blank or null timezone values for Store and GlobalSettings', () => {
    const specs = createModelSpecs(['Store', 'GlobalSettings']);
    const tenantId = 'tenant-123';

    const storeWithNullTimezone = specs[0].transform(
      { id: 'store-1', name: 'Main', timezone: null },
      tenantId
    );
    const settingsWithBlankTimezone = specs[1].transform(
      { id: 'gs-1', timezone: '' },
      tenantId
    );

    expect(storeWithNullTimezone).toEqual({
      status: 'ok',
      item: expect.objectContaining({
        id: 'store-1',
        tenantId,
        timezone: 'America/New_York',
      }),
    });

    expect(settingsWithBlankTimezone).toEqual({
      status: 'ok',
      item: expect.objectContaining({
        id: 'gs-1',
        tenantId,
        timezone: 'America/New_York',
      }),
    });
  });

  it('skips records missing ids', () => {
    const [spec] = createModelSpecs(['Employee']);

    expect(spec.transform({ firstName: 'Orlando' }, 'tenant-1')).toEqual({
      status: 'skip',
      reason: 'Missing required id',
    });
  });
});
