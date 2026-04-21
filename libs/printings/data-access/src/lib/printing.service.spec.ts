import {
  buildReceiptPreviewText,
  buildReceiptLines,
  getReceiptCopyLabel,
  printReceipt,
  registerReceiptPreviewHandler,
  resolveReceiptLayoutProfile,
  stopDiscovery,
} from './printing.service';

const mockIsE2EPrinterSpyEnabled = jest.fn(() => false);
const mockRecordE2EPrintJob = jest.fn();
const mockGetDefaultPrinter = jest.fn();

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

jest.mock('./slices/printer.service', () => ({
  PrinterService: {
    getDefaultPrinter: (...args: unknown[]) => mockGetDefaultPrinter(...args),
  },
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDefaultPrinter.mockResolvedValue(undefined);
  });

  it('resolves receipt layout from detected paper width and model fallback', () => {
    expect(
      resolveReceiptLayoutProfile({ detectedPaperWidth: 576 }).paperWidthMm
    ).toBe(80);
    expect(
      resolveReceiptLayoutProfile({ detectedPaperWidth: 48 }).paperWidthMm
    ).toBe(58);
    expect(resolveReceiptLayoutProfile({ model: 'mC_Print3' }).paperWidthMm).toBe(
      80
    );
    expect(resolveReceiptLayoutProfile({ model: 'Unknown' }).paperWidthMm).toBe(
      58
    );
  });

  it('builds classic receipt lines using real newline characters', () => {
    const text = buildReceiptLines(cart);

    expect(text).toContain('Qty    Description');
    expect(text).toContain('Total\n');
    expect(text).toContain('Coca Cola');
    expect(text).not.toContain('\\n');
  });

  it('uses a wider receipt profile to show more description space', () => {
    const wideCart = {
      items: [
        {
          identifier: 'line-1',
          quantity: 1,
          product: {
            name: '123456789012345678901234567890',
            price: 8.99,
          },
        },
      ],
      footer: {
        baseSubtotal: 8.99,
        total: 8.99,
      },
    };

    const narrowText = buildReceiptLines(
      wideCart,
      undefined,
      resolveReceiptLayoutProfile({ model: 'mC_Print2' })
    );
    const wideText = buildReceiptLines(
      wideCart,
      undefined,
      resolveReceiptLayoutProfile({ model: 'mC_Print3' })
    );

    expect(narrowText).toContain('-'.repeat(32));
    expect(wideText).toContain('-'.repeat(42));
    expect(narrowText).not.toContain('12345678901234567890');
    expect(wideText).toContain('12345678901234567890');
  });

  it('keeps merchant EBT receipts on the shared item-line renderer', () => {
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

    expect(text).toContain('Qty');
    expect(text).toContain('Coca Cola');
    expect(text).not.toContain('Aceite Oliva');
    expect(text).not.toContain('EBT Items\n');
    expect(text).not.toContain('Non-EBT Items\n');
    expect(text).not.toContain('\\n');
  });

  it('renders merchant discounted receipts with the same item-line format as customer receipts', () => {
    const text = buildReceiptLines(
      {
        items: [
          {
            identifier: 'line-1',
            quantity: 2,
            product: {
              name: 'Huevo',
              price: 4.99,
            },
          },
          {
            identifier: 'line-2',
            quantity: 1,
            product: {
              name: 'Color huevo',
              price: 11.99,
            },
          },
        ],
        footer: {
          baseSubtotal: 21.97,
          discount: 2.99,
          total: 18.98,
        },
        appliedDiscountSummary: {
          applications: [],
          approvalEvents: [],
          pricingGeneratedAt: '2026-04-20T15:48:55.000Z',
          warnings: [],
          lineSummaries: [
            {
              lineId: 'line-1',
              lineDiscountTotal: 2.99,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 6.99,
              discounts: [
                {
                  discountApplicationId: 'line-discount-1',
                  applicationType: 'AUTOMATIC_DISCOUNT',
                  scope: 'LINE',
                  method: 'PERCENT',
                  name: 'Test 1%',
                  stackMode: 'STACKABLE',
                  source: 'automatic',
                  value: 30,
                  originalAmount: 9.98,
                  discountAmount: 2.99,
                  finalAmount: 6.99,
                  appliedAt: '2026-04-20T15:48:55.000Z',
                },
              ],
            },
            {
              lineId: 'line-2',
              lineDiscountTotal: 0,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 11.99,
              discounts: [],
            },
          ],
          orderLevelAdjustments: [],
        },
      },
      {
        id: 'order-ebt-1',
        copyType: 'MERCHANT',
        paymentInfo: {
          payments: [{ type: 'EBT', amount: 9.98 }],
        },
        lines: [
          {
            identifier: 'line-1',
            quantity: 2,
            productName: 'Huevo',
            ebtPaidAmount: 6.99,
            nonEbtPaidAmount: 0,
            lineTotalBeforeTax: 6.99,
          },
          {
            identifier: 'line-2',
            quantity: 1,
            productName: 'Color huevo',
            ebtPaidAmount: 9,
            nonEbtPaidAmount: 2.99,
            lineTotalBeforeTax: 11.99,
          },
        ],
      }
    );

    expect(text).toContain('2      Huevo');
    expect(text).toContain('1      Color huevo');
    expect(text).toContain('9.98');
    expect(text).toContain('11.99');
    expect(text).toContain('Discount');
    expect(text).toContain('-$ 2.99');
    expect(text).not.toContain('partial');
    expect(text).not.toContain('Test 1%');
    expect(text).not.toContain('Orig:');
    expect(text).not.toContain('Saved:');
  });

  it('splits partially refunded order receipts into active and refunded sections', () => {
    const text = buildReceiptLines(
      {
        items: [
          {
            identifier: 'line-1',
            quantity: 3,
            product: {
              name: 'Huevo',
              price: 4.99,
            },
          },
        ],
        footer: {
          baseSubtotal: 4.99,
          total: 4.99,
        },
        appliedDiscountSummary: {
          applications: [],
          approvalEvents: [],
          pricingGeneratedAt: '2026-04-20T12:00:00.000Z',
          warnings: [],
          lineSummaries: [
            {
              lineId: 'line-1',
              lineDiscountTotal: 0,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 14.97,
              discounts: [],
            },
          ],
          orderLevelAdjustments: [],
        },
      },
      {
        id: 'order-2',
        status: 'PARTIALLY_REFUNDED',
        refundedQuantities: {
          'line-1': 2,
        },
        lines: [
          {
            identifier: 'line-1',
            quantity: 3,
            productName: 'Huevo',
            lineTotalBeforeTax: 14.97,
          },
        ],
      }
    );

    expect(text).toContain('Active Items\n');
    expect(text).toContain('Refunded Items\n');
    expect(text).toContain('1      Huevo');
    expect(text).toContain('2      Huevo');
    expect(text).toContain('4.99');
    expect(text).toContain('9.98');
  });

  it('shows fully refunded items under the refunded section only', () => {
    const text = buildReceiptLines(
      cart,
      {
        id: 'order-3',
        status: 'REFUNDED',
        refundedQuantities: {
          'line-1': 1,
        },
        lines: [
          {
            identifier: 'line-1',
            quantity: 1,
            productName: 'Coca Cola',
            lineTotalBeforeTax: 8.99,
          },
        ],
      }
    );

    expect(text).toContain('Active Items\n');
    expect(text).toContain('No active items');
    expect(text).toContain('Refunded Items\n');
    expect(text).toContain('Coca Cola');
    expect(text).toContain('8.99');
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
    expect(receiptText).toContain('49.98');
    expect(receiptText).toContain('Discount');
    expect(receiptText).toContain('-$ 14.00');
    expect(receiptText).toContain('Subtotal');
    expect(receiptText).toContain('49.98');
    expect(receiptText).toContain('Discounts');
    expect(receiptText).toContain('-14.00');
    expect(receiptText).not.toContain('Orig:');
    expect(receiptText).not.toContain('Saved:');
    expect(receiptText).not.toContain('20% Off Aceites');
    expect(receiptText).not.toContain('10% Off 25');
    expect(receiptText).toContain('Promo · SAVE10');
  });

  it('uses refunded line amounts so partially refunded receipts show the active total correctly', () => {
    const receiptText = buildReceiptPreviewText(
      {
        name: 'QA Store',
      },
      {
        items: [
          {
            identifier: 'line-1',
            quantity: 3,
            product: {
              name: 'Huevo',
              price: 4.99,
            },
          },
        ],
        footer: {
          baseSubtotal: 14.97,
          discount: 4.49,
          total: 10.48,
        },
        appliedDiscountSummary: {
          applications: [],
          approvalEvents: [],
          pricingGeneratedAt: '2026-04-20T12:00:00.000Z',
          warnings: [],
          lineSummaries: [
            {
              lineId: 'line-1',
              lineDiscountTotal: 4.49,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 10.48,
              discounts: [
                {
                  discountApplicationId: 'line-discount-1',
                  applicationType: 'AUTOMATIC_DISCOUNT',
                  scope: 'LINE',
                  method: 'PERCENT',
                  name: 'Test 1%',
                  stackMode: 'STACKABLE',
                  source: 'automatic',
                  value: 30,
                  originalAmount: 14.97,
                  discountAmount: 4.49,
                  finalAmount: 10.48,
                  appliedAt: '2026-04-20T12:00:00.000Z',
                },
              ],
            },
          ],
          orderLevelAdjustments: [],
        },
      },
      {
        id: 'order-4',
        status: 'PARTIALLY_REFUNDED',
        refundedQuantities: {
          'line-1': 2,
        },
        refundedLineAmounts: {
          'line-1': 5.49,
        },
        lines: [
          {
            identifier: 'line-1',
            quantity: 3,
            productName: 'Huevo',
            price: 4.99,
            lineTotalBeforeTax: 10.48,
          },
        ],
      }
    );

    expect(receiptText).toContain('Active Items');
    expect(receiptText).toContain('Refunded Items');
    expect(receiptText).toContain('1      Huevo');
    expect(receiptText).toContain('4.99');
    expect(receiptText).toContain('2      Huevo');
    expect(receiptText).toContain('9.98');
    expect(receiptText).toContain('Discount');
    expect(receiptText).toContain('-$ 4.49');
    expect(receiptText).not.toContain('Orig:');
    expect(receiptText).not.toContain('Saved:');
    expect(receiptText).not.toContain('Test 1%');
    expect(receiptText).toContain('Total');
    expect(receiptText).toContain('4.99');
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

  it('uses the persisted default printer before falling back to receipt preview', async () => {
    mockIsE2EPrinterSpyEnabled.mockReturnValue(true);
    mockGetDefaultPrinter.mockResolvedValue({
      identifier: 'persisted-printer-1',
    });
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

    expect(mockGetDefaultPrinter).toHaveBeenCalled();
    expect(previewHandler).not.toHaveBeenCalled();
    expect(mockRecordE2EPrintJob).toHaveBeenCalledWith(
      expect.objectContaining({
        printerIdentifier: 'persisted-printer-1',
      })
    );

    unregister();
  });

  it('does not throw when discovery cleanup runs before a manager exists', () => {
    expect(() => stopDiscovery()).not.toThrow();
  });
});
