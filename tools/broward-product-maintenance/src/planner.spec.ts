import { buildMaintenancePlan, summarizePlan } from './planner';

const tenantId = 'f4287488-b0b1-709f-86f8-868782693a83';

describe('broward product maintenance planner', () => {
  it('plans quantity updates only for the selected tenant', () => {
    const plan = buildMaintenancePlan(
      [
        { id: 'p1', tenantId, quantity: 4, barcode: '12345678901234', _version: 2 },
        { id: 'p2', tenantId: 'other', quantity: 3, barcode: '999999999999999', _version: 1 },
      ],
      tenantId
    );

    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({
      id: 'p1',
      tenantId,
      currentQuantity: 4,
      nextQuantity: 1000,
    });
  });

  it('trims only barcodes longer than 14 characters with slice(4)', () => {
    const plan = buildMaintenancePlan(
      [
        { id: 'long', tenantId, quantity: 1000, barcode: '000012345678901', _version: 1 },
        { id: 'exact', tenantId, quantity: 1000, barcode: '12345678901234', _version: 1 },
        { id: 'short', tenantId, quantity: 1000, barcode: '123', _version: 1 },
      ],
      tenantId
    );

    expect(plan.find((item) => item.id === 'long')?.nextBarcode).toBe('12345678901');
    expect(plan.find((item) => item.id === 'exact')?.nextBarcode).toBeUndefined();
    expect(plan.find((item) => item.id === 'short')?.nextBarcode).toBeUndefined();
  });

  it('summarizes quantity and barcode change counts', () => {
    const plan = buildMaintenancePlan(
      [
        { id: 'qty', tenantId, quantity: 9, barcode: '12345678901234', _version: 1 },
        { id: 'barcode', tenantId, quantity: 1000, barcode: '000012345678901', _version: 1 },
      ],
      tenantId
    );

    expect(summarizePlan(plan)).toMatchObject({
      totalProducts: 2,
      quantityChanges: 1,
      barcodeChanges: 1,
    });
  });
});

