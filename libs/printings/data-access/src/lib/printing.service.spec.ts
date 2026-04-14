import {
  buildReceiptPreviewText,
  buildReceiptLines,
  getReceiptCopyLabel,
  printReceipt,
  registerReceiptPreviewHandler,
  stopDiscovery,
} from './printing.service';

const mockIsE2EPrinterSpyEnabled = jest.fn(() => false);
const mockRecordE2EPrintJob = jest.fn();

jest.mock('react-native-star-io10', () => ({
  InterfaceType: { Lan: 'Lan' },
  StarConnectionSettings: jest.fn(),
  StarDeviceDiscoveryManagerFactory: {
    create: jest.fn(),
  },
  StarPrinter: jest.fn(),
  StarXpandCommand: {},
}));

jest.mock('react-native-star-io10/src/StarXpandCommand/Printer/CutType', () => ({
  CutType: { Partial: 'Partial' },
}));

jest.mock('react-native-star-io10/src/StarXpandCommand/Printer/Alignment', () => ({
  Alignment: { Center: 'Center' },
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('@pos/shared/utils', () => ({
  isE2EPrinterSpyEnabled: () => mockIsE2EPrinterSpyEnabled(),
  recordE2EPrintJob: (...args: unknown[]) => mockRecordE2EPrintJob(...args),
}));

describe('printing.service helpers', () => {
  const cart = {
    items: [
      {
        identifier: 'line-1',
        quantity: 1,
        product: {
          name: 'Coca Cola',
          price: 8.99,
        },
      },
    ],
    footer: {
      baseSubtotal: 8.99,
      total: 8.99,
    },
  };

  const discountedCart = {
    items: [
      {
        identifier: 'line-1',
        quantity: 2,
        product: {
          name: 'Aceite vegetal',
          price: 24.99,
        },
      },
    ],
    footer: {
      baseSubtotal: 49.98,
      discount: 14,
      total: 35.98,
    },
    promoCodes: [{ code: 'SAVE10' }],
    appliedDiscountSummary: {
      applications: [],
      approvalEvents: [],
      pricingGeneratedAt: '2026-04-14T12:00:00.000Z',
      warnings: [],
      lineSummaries: [
        {
          lineId: 'line-1',
          lineDiscountTotal: 10,
          allocatedOrderDiscountTotal: 4,
          lineTotalBeforeTax: 35.98,
          discounts: [
            {
              discountApplicationId: 'line-discount-1',
              applicationType: 'AUTOMATIC_DISCOUNT',
              scope: 'LINE',
              method: 'PERCENT',
              name: '20% Off Aceites',
              stackMode: 'STACKABLE',
              source: 'automatic',
              value: 20,
              originalAmount: 49.98,
              discountAmount: 10,
              finalAmount: 39.98,
              appliedAt: '2026-04-14T12:00:00.000Z',
            },
          ],
        },
      ],
      orderLevelAdjustments: [
        {
          discountApplicationId: 'order-discount-1',
          applicationType: 'AUTOMATIC_DISCOUNT',
          scope: 'ORDER',
          method: 'PERCENT',
          name: '10% Off 25',
          stackMode: 'STACKABLE',
          source: 'automatic',
          value: 10,
          originalAmount: 39.98,
          discountAmount: 4,
          finalAmount: 35.98,
          appliedAt: '2026-04-14T12:00:00.000Z',
        },
      ],
    },
  };

  it('builds classic receipt lines using real newline characters', () => {
    const text = buildReceiptLines(cart);

    expect(text).toContain('Qty    Description        Total\n');
    expect(text).toContain('Coca Cola');
    expect(text).not.toContain('\\n');
  });

  it('builds EBT receipt sections using real newline characters', () => {
    const text = buildReceiptLines(cart, {
      id: 'order-1',
      copyType: 'MERCHANT',
      paymentInfo: {
        payments: [{ type: 'EBT', amount: 5 }],
      },
      lines: [
        {
          quantity: 1,
          productName: 'Aceite Oliva',
          ebtPaidAmount: 5,
          nonEbtPaidAmount: 0,
        },
        {
          quantity: 1,
          productName: 'Coca Cola',
          ebtPaidAmount: 0,
          nonEbtPaidAmount: 8.99,
        },
      ],
    });

    expect(text).toContain('EBT Items\n');
    expect(text).toContain('Non-EBT Items\n');
    expect(text).toContain('EBT Paid Total: $ 5.00\n');
    expect(text).not.toContain('\\n');
  });

  it('prefers explicit customer and merchant copy labels over order status', () => {
    expect(
      getReceiptCopyLabel({
        status: 'PAID',
        copyType: 'CUSTOMER',
      })
    ).toBe('** Customer Copy **');
    expect(
      getReceiptCopyLabel({
        status: 'OPEN',
        copyType: 'MERCHANT',
      })
    ).toBe('** Merchant Copy **');
  });

  it('does not infer an extra copy and falls back to status only when copy type is absent', () => {
    expect(getReceiptCopyLabel({ status: 'OPEN' })).toBe('** Customer Copy **');
    expect(getReceiptCopyLabel({ status: 'PAID' })).toBe('** Merchant Copy **');
  });

  it('builds a printable receipt preview text with the copy label', () => {
    const receiptText = buildReceiptPreviewText(
      {
        name: 'QA Store',
        address: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        phone: '305-000-0000',
        fax: '',
        email: 'qa@example.com',
        disclaimer: 'All sales are final.',
      },
      cart,
      {
        id: 'order-1',
        orderNo: '01-01-260325-0001',
        copyType: 'MERCHANT',
      }
    );

    expect(receiptText).toContain('QA Store');
    expect(receiptText).toContain('** Merchant Copy **');
    expect(receiptText).toContain('01-01-260325-0001');
  });

  it('omits empty phone and fax labels from the receipt preview header', () => {
    const receiptText = buildReceiptPreviewText(
      {
        name: 'QA Store',
        address: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        email: 'qa@example.com',
      },
      cart
    );

    expect(receiptText).toContain('QA Store');
    expect(receiptText).toContain('qa@example.com');
    expect(receiptText).not.toContain('P: ');
    expect(receiptText).not.toContain('F: ');
  });

  it('includes discount breakdown and adjusted totals in receipt preview text', () => {
    const receiptText = buildReceiptPreviewText(
      {
        name: 'QA Store',
      },
      discountedCart,
      {
        id: 'order-1',
        orderNo: '01-01-260325-0002',
        copyType: 'MERCHANT',
      }
    );

    expect(receiptText).toContain('Aceite vegetal');
    expect(receiptText).toContain('35.98');
    expect(receiptText).toContain('Subtotal');
    expect(receiptText).toContain('49.98');
    expect(receiptText).toContain('Discounts');
    expect(receiptText).toContain('-14.00');
    expect(receiptText).toContain('Line · 20% Off Aceites');
    expect(receiptText).toContain('Order · 10% Off 25');
    expect(receiptText).toContain('Promo · SAVE10');
  });

  it('records the print job through the E2E printer spy without using hardware transport', async () => {
    mockIsE2EPrinterSpyEnabled.mockReturnValue(true);

    await printReceipt(
      {
        name: 'QA Store',
        address: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        phone: '305-000-0000',
        fax: '',
        email: 'qa@example.com',
        disclaimer: 'All sales are final.',
      },
      {
        identifier: 'printer-1',
      } as any,
      cart,
      {
        id: 'order-1',
        orderNo: '01-01-260325-0001',
        copyType: 'CUSTOMER',
      }
    );

    expect(mockRecordE2EPrintJob).toHaveBeenCalledWith(
      expect.objectContaining({
        printerIdentifier: 'printer-1',
        orderId: 'order-1',
        orderNo: '01-01-260325-0001',
        copyType: 'CUSTOMER',
      })
    );
  });

  it('emits a receipt preview when no printer is configured', async () => {
    const previewHandler = jest.fn();
    const unregister = registerReceiptPreviewHandler(previewHandler);

    await printReceipt(
      {
        name: 'QA Store',
        address: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        phone: '305-000-0000',
        fax: '',
        email: 'qa@example.com',
        disclaimer: 'All sales are final.',
      },
      undefined,
      cart,
      {
        id: 'order-1',
        orderNo: '01-01-260325-0001',
        copyType: 'CUSTOMER',
      }
    );

    expect(previewHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        copyType: 'CUSTOMER',
        orderNo: '01-01-260325-0001',
      })
    );

    unregister();
  });

  it('does not throw when discovery cleanup runs before a manager exists', () => {
    expect(() => stopDiscovery()).not.toThrow();
  });
});
