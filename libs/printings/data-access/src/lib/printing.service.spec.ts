import {
  buildReceiptLines,
  buildReceiptPreviewText,
  getReceiptCopyLabel,
  printReceipt,
  registerReceiptPreviewHandler,
  resolveReceiptLayoutProfile,
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

describe('printing.service ticket rendering', () => {
  const store = {
    name: 'Bincrafters',
    address: '18078 NW 89 PL',
    city: 'Hialeah',
    state: 'FL',
    zipCode: '33018',
    phone: '7865662852',
    email: 'orlaqp@gmail.com',
    disclaimer: 'Thanks for shopping',
  };

  const standardTicket = {
    isReceipt: true,
    orderId: 'order-1',
    orderNo: '1-OWNER-260421-0005',
    copyType: 'CUSTOMER' as const,
    sections: [
      {
        title: 'Items',
        emptyLabel: 'No items',
        rows: [
          {
            identifier: 'line-1',
            quantity: 2,
            name: 'Huevo',
            amount: 9.98,
            detailRows: [{ label: 'Discount', amount: -2.99 }],
          },
          {
            identifier: 'line-2',
            quantity: 1,
            name: 'Huevo CAJA',
            amount: 19.99,
            detailRows: [],
          },
        ],
      },
    ],
    totals: {
      subtotal: 29.97,
      discount: 2.99,
      tax: 0,
      total: 26.98,
    },
    paymentRows: [{ kind: 'payment' as const, label: 'EBT', amount: 26.98 }],
    promoCodes: ['SAVE10'],
  };

  const partialRefundTicket = {
    isReceipt: true,
    orderId: 'order-2',
    orderNo: '1-OWNER-260421-0006',
    copyType: 'MERCHANT' as const,
    sections: [
      {
        title: 'Active Items',
        emptyLabel: 'No active items',
        rows: [
          {
            identifier: 'line-1',
            quantity: 1,
            name: 'Aceite vegetal',
            amount: 24.99,
            detailRows: [],
          },
          {
            identifier: 'line-2',
            quantity: 1,
            name: 'Huevo',
            amount: 4.99,
            detailRows: [],
          },
        ],
      },
      {
        title: 'Refunded Items',
        emptyLabel: 'No refunded items',
        rows: [
          {
            identifier: 'line-3',
            quantity: 1,
            name: 'Manteca de cerd',
            amount: 45.99,
            detailRows: [],
          },
        ],
      },
    ],
    totals: {
      subtotal: 49.98,
      discount: 0,
      tax: 0,
      total: 49.98,
    },
    paymentRows: [
      { kind: 'heading' as const, label: 'Original Payments' },
      { kind: 'payment' as const, label: 'EBT', amount: 97.96 },
      { kind: 'heading' as const, label: 'Refund Payments' },
      { kind: 'payment' as const, label: 'CC', amount: -47.98 },
    ],
    promoCodes: [],
  };

  const previewTicket = {
    isReceipt: false,
    copyType: 'CUSTOMER' as const,
    sections: [
      {
        title: 'Items',
        emptyLabel: 'No items',
        rows: [
          {
            identifier: 'preview-1',
            quantity: 1,
            name: 'Color huevo',
            amount: 11.99,
            detailRows: [],
          },
        ],
      },
    ],
    totals: {
      subtotal: 11.99,
      discount: 0,
      tax: 0,
      total: 11.99,
    },
    paymentRows: [],
    promoCodes: [],
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

  it('renders standard ticket lines with negative discount detail rows', () => {
    const text = buildReceiptLines(standardTicket);

    expect(text).toContain('Qty    Description');
    expect(text).toContain('Huevo');
    expect(text).toContain('Discount');
    expect(text).toContain('-$ 2.99');
    expect(text).not.toContain('\\n');
  });

  it('uses the wider receipt profile to expose more description width', () => {
    const wideTicket = {
      ...previewTicket,
      sections: [
        {
          title: 'Items',
          emptyLabel: 'No items',
          rows: [
            {
              identifier: 'preview-1',
              quantity: 1,
              name: '123456789012345678901234567890',
              amount: 11.99,
              detailRows: [],
            },
          ],
        },
      ],
    };

    const narrowText = buildReceiptLines(
      wideTicket,
      resolveReceiptLayoutProfile({ model: 'mC_Print2' })
    );
    const wideText = buildReceiptLines(
      wideTicket,
      resolveReceiptLayoutProfile({ model: 'mC_Print3' })
    );

    expect(narrowText).toContain('-'.repeat(32));
    expect(wideText).toContain('-'.repeat(42));
    expect(wideText).toContain('1234567890123456789012345');
  });

  it('renders refund tickets from the provided sections without recomputing discounts', () => {
    const text = buildReceiptLines(partialRefundTicket);

    expect(text).toContain('Active Items');
    expect(text).toContain('Refunded Items');
    expect(text).toContain('Manteca de cerd');
    expect(text).not.toContain('Discount\n');
  });

  it('derives copy labels from the canonical ticket model', () => {
    expect(getReceiptCopyLabel({ copyType: 'CUSTOMER', isReceipt: true } as any)).toBe(
      '** Customer Copy **'
    );
    expect(getReceiptCopyLabel({ copyType: 'MERCHANT', isReceipt: true } as any)).toBe(
      '** Merchant Copy **'
    );
    expect(getReceiptCopyLabel({ isReceipt: false } as any)).toBe(
      '** Customer Copy **'
    );
  });

  it('builds preview text with reconciled payment rows for refund receipts', () => {
    const receiptText = buildReceiptPreviewText(
      store,
      partialRefundTicket,
      new Date('2026-04-21T17:31:14.000Z')
    );

    expect(receiptText).toContain('Original Payments');
    expect(receiptText).toContain('EBT: $ 97.96');
    expect(receiptText).toContain('Refund Payments');
    expect(receiptText).toContain('CC: -$ 47.98');
    expect(receiptText).toContain('49.98');
    expect(receiptText).toContain('** Merchant Copy **');
  });

  it('builds preview text for non-receipt previews without receipt footer data', () => {
    const receiptText = buildReceiptPreviewText(
      store,
      previewTicket,
      new Date('2026-04-21T17:31:14.000Z')
    );

    expect(receiptText).toContain('*** NOT A RECEIPT ***');
    expect(receiptText).not.toContain('Original Payments');
  });

  it('routes printerless previews through the registered preview handler', async () => {
    const handler = jest.fn();
    const unsubscribe = registerReceiptPreviewHandler(handler);

    await printReceipt(store, undefined, standardTicket);

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        copyType: 'CUSTOMER',
        orderNo: '1-OWNER-260421-0005',
      })
    );

    unsubscribe();
  });

  it('records E2E print jobs from canonical ticket totals', async () => {
    mockIsE2EPrinterSpyEnabled.mockReturnValue(true);
    const printer = { identifier: 'printer-1', model: 'mC_Print3' };

    await printReceipt(store, printer as any, standardTicket);

    expect(mockRecordE2EPrintJob).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-1',
        orderNo: '1-OWNER-260421-0005',
        total: 26.98,
        copyType: 'CUSTOMER',
      })
    );
  });
});
