import {
    InterfaceType,
    StarConnectionSettings,
    StarDeviceDiscoveryManager,
    StarDeviceDiscoveryManagerFactory,
    StarPrinter,
    StarXpandCommand,
} from 'react-native-star-io10';
import { PrinterEntity } from './slices/printer.entity';
import { Alert } from 'react-native';
import { CutType } from 'react-native-star-io10/src/StarXpandCommand/Printer/CutType';
import { Alignment } from 'react-native-star-io10/src/StarXpandCommand/Printer/Alignment';
import {
    isE2EPrinterSpyEnabled,
    recordE2EPrintJob,
} from '@pos/shared/utils';
import type { AppliedDiscountSummary } from '@pos/discounts/domain';
import { PrinterService } from './slices/printer.service';

type ReceiptStoreInfo = {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    fax?: string;
    email?: string;
    disclaimer?: string;
};

type ReceiptCartState = {
    items: Array<{
        identifier?: string;
        quantity: number;
        product: {
            name: string;
            price: number;
        };
    }>;
    footer: {
        baseSubtotal?: number;
        subtotal?: number;
        discount?: number;
        tax?: number;
        savingsTotal?: number;
        total: number;
    };
    promoCodes?: Array<{ code: string }>;
    appliedDiscountSummary?: AppliedDiscountSummary;
};

type ReceiptOrderEntity = {
    id?: string;
    status?: 'OPEN' | 'PAID' | 'REFUNDED' | string;
    orderNo?: string;
    copyType?: 'CUSTOMER' | 'MERCHANT';
    refundedQuantities?: Record<string, number> | null;
    refundedLineAmounts?: Record<string, number> | null;
    paymentInfo?: {
        payments?: Array<{
            type: string;
            amount: number;
        }>;
    };
    lines?: Array<{
        identifier?: string;
        quantity?: number;
        productName?: string;
        price?: number;
        lineTotalBeforeTax?: number;
        lineTotalAfterTax?: number;
        ebtPaidAmount?: number;
        nonEbtPaidAmount?: number;
    }>;
};

type ReceiptDiscountDetailRow = {
    label: string;
    amount: number;
};

type ReceiptLineDisplayRow = {
    identifier: string;
    quantity: number;
    name: string;
    originalAmount: number;
    finalAmount: number;
    discountDetails: ReceiptDiscountDetailRow[];
};

type ReceiptSection = {
    title: string;
    emptyLabel: string;
    rows: ReceiptLineDisplayRow[];
};

type ReceiptTotalsSummary = {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    orderDiscountDetails: ReceiptDiscountDetailRow[];
};

type ReceiptRenderModel = {
    sections: ReceiptSection[];
    totals: ReceiptTotalsSummary;
};

type ReceiptLayoutProfile = {
    paperWidthMm: number;
    totalColumns: number;
    qtyWidth: number;
    descriptionWidth: number;
    amountWidth: number;
    detailIndent: number;
    totalLabelWidth: number;
    totalAmountWidth: number;
};

export type ReceiptPreviewPayload = {
    copyType?: 'CUSTOMER' | 'MERCHANT';
    orderNo?: string;
    receiptText: string;
};

let starManager: StarDeviceDiscoveryManager;
let receiptPreviewHandler:
    | ((payload: ReceiptPreviewPayload) => void)
    | null = null;

const NARROW_RECEIPT_LAYOUT_PROFILE: ReceiptLayoutProfile = {
    paperWidthMm: 58,
    totalColumns: 32,
    qtyWidth: 5,
    descriptionWidth: 15,
    amountWidth: 8,
    detailIndent: 6,
    totalLabelWidth: 20,
    totalAmountWidth: 12,
};

const WIDE_RECEIPT_LAYOUT_PROFILE: ReceiptLayoutProfile = {
    paperWidthMm: 80,
    totalColumns: 42,
    qtyWidth: 5,
    descriptionWidth: 25,
    amountWidth: 8,
    detailIndent: 8,
    totalLabelWidth: 28,
    totalAmountWidth: 14,
};

const DEFAULT_RECEIPT_LAYOUT_PROFILE = NARROW_RECEIPT_LAYOUT_PROFILE;

const logReceiptTiming = (step: string, details?: Record<string, unknown>) => {
    void step;
    void details;
};

const buildStoreHeaderText = (store: ReceiptStoreInfo) => {
    const lines = [store.name, store.address, `${store.city ?? ''}, ${store.state ?? ''} ${store.zipCode ?? ''}`.trim()]
        .filter((line) => !!line && line.trim().length > 0);

    if (store.phone) {
        lines.push(store.phone);
    }

    if (store.fax) {
        lines.push(store.fax);
    }

    if (store.email) {
        lines.push(store.email);
    }

    return `${lines.join('\n')}\n\n`;
};

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const resolveReceiptLayoutProfileFromDetectedWidth = (
    detectedPaperWidth?: number | null
): ReceiptLayoutProfile | undefined => {
    if (!isFiniteNumber(detectedPaperWidth)) {
        return undefined;
    }

    const width = Math.abs(detectedPaperWidth);

    if (width >= 500) {
        return WIDE_RECEIPT_LAYOUT_PROFILE;
    }

    if (width >= 300) {
        return NARROW_RECEIPT_LAYOUT_PROFILE;
    }

    if (width >= 70) {
        return WIDE_RECEIPT_LAYOUT_PROFILE;
    }

    if (width >= 45) {
        return NARROW_RECEIPT_LAYOUT_PROFILE;
    }

    if (width >= 3) {
        return WIDE_RECEIPT_LAYOUT_PROFILE;
    }

    if (width >= 2) {
        return NARROW_RECEIPT_LAYOUT_PROFILE;
    }

    return undefined;
};

const resolveReceiptLayoutProfileFromModel = (
    model?: string | null
): ReceiptLayoutProfile | undefined => {
    const normalizedModel = String(model || '').trim();

    if (!normalizedModel) {
        return undefined;
    }

    const wideModels = new Set(['mC_Print3', 'TSP800II', 'SK1_3xx']);
    const narrowModels = new Set(['mC_Print2', 'SM_S210i', 'SM_S230i', 'SM_L200']);

    if (wideModels.has(normalizedModel)) {
        return WIDE_RECEIPT_LAYOUT_PROFILE;
    }

    if (narrowModels.has(normalizedModel)) {
        return NARROW_RECEIPT_LAYOUT_PROFILE;
    }

    return undefined;
};

export const resolveReceiptLayoutProfile = ({
    detectedPaperWidth,
    model,
}: {
    detectedPaperWidth?: number | null;
    model?: string | null;
} = {}): ReceiptLayoutProfile =>
    resolveReceiptLayoutProfileFromDetectedWidth(detectedPaperWidth) ||
    resolveReceiptLayoutProfileFromModel(model) ||
    DEFAULT_RECEIPT_LAYOUT_PROFILE;

const detectReceiptLayoutProfile = async (
    printerInfo: PrinterEntity
): Promise<ReceiptLayoutProfile> => {
    const settings = new StarConnectionSettings();
    settings.interfaceType = InterfaceType.Lan;
    settings.identifier = printerInfo.identifier;

    const printer = new StarPrinter(settings);
    let detectedPaperWidth: number | undefined;
    let model = printerInfo.model;

    try {
        await printer.open();
        model = String(printer.information?.model || model || '');

        try {
            const status = await printer.getStatus();
            detectedPaperWidth = status?.detail?.detectedPaperWidth;
        } catch {
            // Fall back to model/default if runtime width cannot be read.
        }
    } catch {
        return resolveReceiptLayoutProfile({ model });
    } finally {
        try {
            await printer.close();
        } catch {
            // Ignore close errors during capability detection fallback.
        }

        try {
            await printer.dispose();
        } catch {
            // Ignore disposal errors during capability detection fallback.
        }
    }

    return resolveReceiptLayoutProfile({ detectedPaperWidth, model });
};


export const discoverStarPrinters = async (): Promise<StarPrinter[]> => {
    return new Promise((resolve, reject) => {
        const printers: StarPrinter[] = [];
        // Specify your printer interface types.
        StarDeviceDiscoveryManagerFactory.create([
            InterfaceType.Lan,
            // InterfaceType.Bluetooth,
            // InterfaceType.BluetoothLE,
        ])
            .then((manager) => {
                starManager = manager;
                // Set discovery time. (option)
                manager.discoveryTime = 10000;

                // Callback for printer found.
                manager.onPrinterFound = (printer: StarPrinter) => {
                    printers.push(printer);
                };

                // Callback for discovery finished. (option)
                manager.onDiscoveryFinished = () => {
                    resolve(printers);
                };

                // Start discovery.
                manager.startDiscovery();

                // Stop discovery.
                // await manager.stopDiscovery()
                return printers;
            })
            .catch((error) => {
                console.error('Error while searching for printers...', error);
                reject(error);
            });
    });
};

export const stopDiscovery = () => {
    if (!starManager) {
        return;
    }

    try {
        starManager.stopDiscovery();
    } catch (error) {
        console.error('Error while stopping printer discovery...', error);
    }
};

export const printReceipt = async (
    store: ReceiptStoreInfo,
    printerInfo: PrinterEntity | undefined,
    cart: ReceiptCartState,
    order?: ReceiptOrderEntity,
) => {
    const startedAt = Date.now();
    if (!store) {
        Alert.alert('Store information should be available in order to preview or print.');
        return;
    }

    const resolvedPrinterInfo = printerInfo ?? (await PrinterService.getDefaultPrinter());

    if (!resolvedPrinterInfo) {
        if (!receiptPreviewHandler) {
            Alert.alert('No printer is configured for this device.');
            return;
        }

        receiptPreviewHandler({
            copyType: order?.copyType,
            orderNo: order?.orderNo,
            receiptText: buildReceiptPreviewText(
                store,
                cart,
                order,
                undefined,
                DEFAULT_RECEIPT_LAYOUT_PROFILE
            ),
        });
        return;
    }

    logReceiptTiming('print-receipt-start', {
        orderId: order?.id,
        orderNo: order?.orderNo,
        copyType: order?.copyType,
        printerIdentifier: resolvedPrinterInfo.identifier,
    });
    await printSingleReceipt(store, resolvedPrinterInfo as PrinterEntity, cart, order);
    logReceiptTiming('print-receipt-end', {
        orderId: order?.id,
        orderNo: order?.orderNo,
        copyType: order?.copyType,
        printerIdentifier: resolvedPrinterInfo.identifier,
        durationMs: Date.now() - startedAt,
    });
};

export const registerReceiptPreviewHandler = (
    handler: (payload: ReceiptPreviewPayload) => void
) => {
    receiptPreviewHandler = handler;

    return () => {
        if (receiptPreviewHandler === handler) {
            receiptPreviewHandler = null;
        }
    };
};

const printSingleReceipt = async (
    store: ReceiptStoreInfo,
    printerInfo: PrinterEntity,
    cart: ReceiptCartState,
    order?: ReceiptOrderEntity
) => {
    const date = new Date();
    const layoutProfile = isE2EPrinterSpyEnabled()
        ? resolveReceiptLayoutProfile({ model: printerInfo.model })
        : await detectReceiptLayoutProfile(printerInfo);
    const separatorLine = `${'-'.repeat(layoutProfile.totalColumns)}\n`;
    const renderModel = buildReceiptRenderModel(cart, order);
    const receiptLines = buildReceiptLines(cart, order, layoutProfile);
    const receiptTotalsBreakdown = buildReceiptTotalsBreakdownText(
        cart,
        order,
        layoutProfile
    );
    const totalPaymentsText = getReceiptPaymentsText(order);
    const copyLabel = getReceiptCopyLabel(order);
    const receiptText = buildReceiptPreviewText(
        store,
        cart,
        order,
        date,
        layoutProfile
    );

    if (isE2EPrinterSpyEnabled()) {
        recordE2EPrintJob({
            timestamp: date.toISOString(),
            printerIdentifier: printerInfo.identifier,
            orderId: order?.id,
            orderNo: order?.orderNo,
            copyType: order?.copyType,
            copyLabel,
            total: renderModel.totals.total,
            paymentSummaryText: totalPaymentsText,
            receiptText,
        });
        return;
    }

    await print(printerInfo, (builder) => {

        const printerBuilder = new StarXpandCommand.PrinterBuilder()
            .styleInternationalCharacter(
                StarXpandCommand.Printer.InternationalCharacterType.Usa
            )
            .styleCharacterSpace(0)
            .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
            .styleBold(true)
            .actionPrintText(`${store.name}\n`)
            .actionPrintText(buildStoreHeaderText({ ...store, name: undefined }))
            .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
            .actionPrintText(
                `Date:${date.toLocaleString()}\n` +
                    // '--------------------------------\n' +
                    '\n'
            )
            .styleAlignment(StarXpandCommand.Printer.Alignment.Left)
            .actionPrintText(receiptLines)
            .actionPrintText(receiptTotalsBreakdown)
            .actionPrintText(separatorLine)
            .styleBold(true)
            .actionPrintText('Total\n')
            .add(
                new StarXpandCommand.PrinterBuilder()
                    .styleAlignment(StarXpandCommand.Printer.Alignment.Right)
                    .styleBold(true)
                    .styleMagnification(
                        new StarXpandCommand.MagnificationParameter(2, 2)
                    )
                    .actionPrintText(
                        `${formatReceiptCurrency(renderModel.totals.total)}\n`
                    )
            )
            .styleAlignment(StarXpandCommand.Printer.Alignment.Left)
            .styleBold(true)
            .actionPrintText(
                cart.promoCodes?.length
                    ? cart.promoCodes
                          .map((promo) => `Promo · ${promo.code}`)
                          .join('\n') + '\n'
                    : ''
            )
            
        if (order?.id) {
            printerBuilder
                .styleAlignment(StarXpandCommand.Printer.Alignment.Right)
                .actionPrintText(totalPaymentsText)
                .actionFeedLine(2)
                .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                .add(
                    new StarXpandCommand.PrinterBuilder()
                        .styleInvert(true)
                        .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                        .actionPrintText(` ${store.disclaimer} \n`)
                )
                .actionFeedLine(1)
                .actionPrintText(copyLabel)
                .actionFeedLine(1)
                .actionPrintQRCode(
                    new StarXpandCommand.Printer.QRCodeParameter(
                        `${order?.orderNo}\n`
                    )
                        .setModel(StarXpandCommand.Printer.QRCodeModel.Model2)
                        .setLevel(StarXpandCommand.Printer.QRCodeLevel.L)
                        .setCellSize(8)
                )
                .actionFeedLine(1)
                .actionPrintText(`${order?.orderNo}\n`)
                .actionFeedLine(1);
        } else {
            printerBuilder
                .styleAlignment(Alignment.Center)
                .actionPrintText('*** NOT A RECEIPT ***')
                .actionFeedLine(1);
        }

        printerBuilder.actionCut(CutType.Partial);

        builder.addDocument(
            new StarXpandCommand.DocumentBuilder().addPrinter(printerBuilder)
        );
    });
};

export const print = async (
    printerInfo: PrinterEntity,
    dataBuilder: (builder: StarXpandCommand.StarXpandCommandBuilder) => void
): Promise<void> => {
    const startedAt = Date.now();
    const settings = new StarConnectionSettings();
    settings.interfaceType = InterfaceType.Lan;
    settings.identifier = printerInfo.identifier;

    const printer = new StarPrinter(settings);

    try {
        const openStartedAt = Date.now();
        await printer.open();
        logReceiptTiming('printer-open-complete', {
            printerIdentifier: printerInfo.identifier,
            durationMs: Date.now() - openStartedAt,
        });
        const builder = new StarXpandCommand.StarXpandCommandBuilder();
        dataBuilder(builder);
        const commands = await builder.getCommands();
        const printStartedAt = Date.now();
        await printer.print(commands);
        logReceiptTiming('printer-print-complete', {
            printerIdentifier: printerInfo.identifier,
            durationMs: Date.now() - printStartedAt,
        });
    } catch (error) {
        console.error(error);
    } finally {
        const closeStartedAt = Date.now();
        await printer.close();
        await printer.dispose();
        logReceiptTiming('printer-close-complete', {
            printerIdentifier: printerInfo.identifier,
            durationMs: Date.now() - closeStartedAt,
            totalDurationMs: Date.now() - startedAt,
        });
    }
};

const getReceiptPaymentsText = (order?: ReceiptOrderEntity) =>
    order?.paymentInfo?.payments
        ?.map((payment) => `${payment.type}: $ ${payment.amount.toFixed(2)}`)
        .join('\n') || '';

const buildReceiptTotalsBreakdownText = (
    cart: ReceiptCartState,
    order?: ReceiptOrderEntity,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const renderModel = buildReceiptRenderModel(cart, order);
    const rows: string[] = [];
    const baseSubtotal = renderModel.totals.subtotal;
    const discountTotal = renderModel.totals.discount;
    const tax = renderModel.totals.tax;

    rows.push(formatTotalRow('Subtotal', baseSubtotal, layoutProfile));

    if (discountTotal > 0) {
        rows.push(formatTotalRow('Discounts', -discountTotal, layoutProfile));
    }

    if (tax > 0) {
        rows.push(formatTotalRow('Tax', tax, layoutProfile));
    }

    return rows.join('');
};

const formatTotalRow = (
    label: string,
    amount: number,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) =>
    `${label.padEnd(layoutProfile.totalLabelWidth, ' ')}${amount
        .toFixed(2)
        .padStart(layoutProfile.totalAmountWidth, ' ')}\n`;

const formatReceiptCurrency = (amount: number) => `$ ${amount.toFixed(2)}`;

const buildReceiptTotalsText = (
    cart: ReceiptCartState,
    order?: ReceiptOrderEntity,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const renderModel = buildReceiptRenderModel(cart, order);
    const rows = [buildReceiptTotalsBreakdownText(cart, order, layoutProfile)];
    rows.push(`${'-'.repeat(layoutProfile.totalColumns)}\n`);
    rows.push(formatTotalRow('Total', renderModel.totals.total, layoutProfile));

    if (cart.promoCodes?.length) {
        rows.push(
            cart.promoCodes.map((promo) => `Promo · ${promo.code}`).join('\n') +
                '\n'
        );
    }

    return rows.join('');
};

const getLineSummary = (
    cart: ReceiptCartState,
    item: ReceiptCartState['items'][number],
    index: number
) => {
    const itemIdentifier = item.identifier ?? `line-${index}`;
    return cart.appliedDiscountSummary?.lineSummaries.find(
        (summary) => summary.lineId === itemIdentifier
    );
};

export const buildReceiptPreviewText = (
    store: ReceiptStoreInfo,
    cart: ReceiptCartState,
    order?: ReceiptOrderEntity,
    date = new Date(),
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const receiptLines = buildReceiptLines(cart, order, layoutProfile);
    const totalPaymentsText = getReceiptPaymentsText(order);
    const copyLabel = getReceiptCopyLabel(order);
    const totalText = buildReceiptTotalsText(cart, order, layoutProfile);
    const footerText = order?.id
        ? `${totalPaymentsText}\n\n${store.disclaimer ?? ''}\n${copyLabel}\n${order?.orderNo ?? ''}\n`
        : '*** NOT A RECEIPT ***\n';

    return `${store.name ?? ''}\n${buildStoreHeaderText({
        ...store,
        name: undefined,
    })}Date:${date.toLocaleString()}\n\n${receiptLines}${totalText}${footerText}`;
};

const formatQty = (quantity: number) =>
    quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);

const formatLine = (
    qty: number,
    name: string,
    amount: number,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) =>
    `${formatQty(qty).padEnd(layoutProfile.qtyWidth, ' ')}  ${name
        .substring(0, layoutProfile.descriptionWidth)
        .padEnd(layoutProfile.descriptionWidth, ' ')}  ${amount
        .toFixed(2)
        .padStart(layoutProfile.amountWidth, ' ')}`;

const roundMoney = (amount: number) =>
    Math.round((amount + Number.EPSILON) * 100) / 100;

export const getReceiptCopyLabel = (order?: ReceiptOrderEntity) =>
    order?.copyType === 'CUSTOMER'
        ? '** Customer Copy **'
        : order?.copyType === 'MERCHANT'
        ? '** Merchant Copy **'
        : order?.status === 'OPEN'
        ? '** Customer Copy **'
        : '** Merchant Copy **';

const buildReceiptHeaderRow = (
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) =>
    `${'Qty'.padEnd(layoutProfile.qtyWidth, ' ')}  ${'Description'
        .substring(0, layoutProfile.descriptionWidth)
        .padEnd(layoutProfile.descriptionWidth, ' ')}  ${'Total'.padStart(
        layoutProfile.amountWidth,
        ' '
    )}`;

const formatReceiptLineRow = (
    row: ReceiptLineDisplayRow,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const hasDiscount = roundMoney(row.originalAmount - row.finalAmount) > 0;
    const lines = [
        formatLine(
            row.quantity,
            row.name,
            hasDiscount ? row.originalAmount : row.finalAmount,
            layoutProfile
        ),
    ];

    if (hasDiscount) {
        const discountAmount = `-${formatReceiptCurrency(
            roundMoney(row.originalAmount - row.finalAmount)
        )}`;
        const prefix = `${' '.repeat(layoutProfile.detailIndent)}Discount`;
        lines.push(
            `${prefix.padEnd(
                Math.max(layoutProfile.totalColumns - discountAmount.length, prefix.length),
                ' '
            )}${discountAmount}`
        );
    }

    return lines.join('\n');
};

const buildClassicLines = (
    rows: ReceiptLineDisplayRow[],
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    return (
        `${buildReceiptHeaderRow(layoutProfile)}\n` +
        `${'-'.repeat(layoutProfile.totalColumns)}\n` +
        rows.map((row) => formatReceiptLineRow(row, layoutProfile))
            .join('\n') +
        '\n\n' +
        `${'-'.repeat(layoutProfile.totalColumns)}\n`
    );
};

const buildRefundedSection = (
    title: string,
    entries: ReceiptLineDisplayRow[],
    emptyLabel: string,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) =>
    `${title}\n` +
    `${buildReceiptHeaderRow(layoutProfile)}\n` +
    `${'-'.repeat(layoutProfile.totalColumns)}\n` +
    (entries.length
        ? entries.map((entry) => formatReceiptLineRow(entry, layoutProfile)).join('\n')
        : emptyLabel) +
    '\n\n';

export const buildReceiptLines = (
    cart: ReceiptCartState,
    order?: ReceiptOrderEntity,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const renderModel = buildReceiptRenderModel(cart, order);
    const hasRefundSections = renderModel.sections.length > 1;

    if (hasRefundSections) {
        return (
            renderModel.sections
                .map((section) =>
                    buildRefundedSection(
                        section.title,
                        section.rows,
                        section.emptyLabel,
                        layoutProfile
                    )
                )
                .join('') + `${'-'.repeat(layoutProfile.totalColumns)}\n`
        );
    }

    return buildClassicLines(renderModel.sections[0]?.rows || [], layoutProfile);
};

const buildReceiptRenderModel = (
    cart: ReceiptCartState,
    order?: ReceiptOrderEntity
): ReceiptRenderModel => {
    const hasRefundedQuantities = Object.values(order?.refundedQuantities || {}).some(
        (quantity) => Number(quantity || 0) > 0
    );

    if (order?.lines?.length && hasRefundedQuantities) {
        return buildRefundSplitReceiptModel(cart, order);
    }

    const standardRows = buildStandardReceiptRows(cart);
    return {
        sections: [
            {
                title: 'Items',
                emptyLabel: 'No items',
                rows: standardRows,
            },
        ],
        totals: {
            subtotal:
                cart.footer.baseSubtotal ?? cart.footer.subtotal ?? cart.footer.total,
            discount: cart.footer.discount ?? cart.footer.savingsTotal ?? 0,
            tax: cart.footer.tax ?? 0,
            total: cart.footer.total,
            orderDiscountDetails: getUnattributedOrderDiscountDetails(cart),
        },
    };
};

const buildStandardReceiptRows = (cart: ReceiptCartState): ReceiptLineDisplayRow[] =>
    cart.items.map((item, index) => {
        const identifier = item.identifier ?? `line-${index}`;
        const lineSummary = getLineSummary(cart, item, index);
        const originalAmount = roundMoney(item.product.price * item.quantity);
        const finalAmount =
            lineSummary?.lineTotalBeforeTax ?? originalAmount;

        return {
            identifier,
            quantity: item.quantity,
            name: item.product.name,
            originalAmount,
            finalAmount,
            discountDetails: buildReceiptDiscountDetailsForSavings(
                cart,
                lineSummary,
                roundMoney(originalAmount - finalAmount)
            ),
        };
    });

const buildRefundSplitReceiptModel = (
    cart: ReceiptCartState,
    order: ReceiptOrderEntity
): ReceiptRenderModel => {
    const refundedQuantities = order.refundedQuantities || {};
    const refundedLineAmounts = order.refundedLineAmounts || {};
    const activeRows: ReceiptLineDisplayRow[] = [];
    const refundedRows: ReceiptLineDisplayRow[] = [];
    let activeSubtotal = 0;
    let activeTotal = 0;
    let activeTax = 0;

    (order.lines || []).forEach((line, index) => {
        const identifier = String(line.identifier || `line-${index}`);
        const originalQuantity = Number(line.quantity || 0);
        if (originalQuantity <= 0) {
            return;
        }

        const fallbackItem =
            cart.items.find(
                (item, itemIndex) =>
                    (item.identifier || `line-${itemIndex}`) === identifier
            ) || cart.items[index];
        const lineSummary = fallbackItem
            ? getLineSummary(
                  cart,
                  fallbackItem,
                  cart.items.findIndex((item) => item === fallbackItem)
              )
            : undefined;
        const baseUnitPrice = Number(
            line.price ??
                fallbackItem?.product.price ??
                (originalQuantity > 0
                    ? Number(line.lineTotalBeforeTax || 0) / originalQuantity
                    : 0)
        );
        const originalAmount = roundMoney(baseUnitPrice * originalQuantity);
        const originalFinalAmount = roundMoney(
            Number(
                line.lineTotalBeforeTax ??
                    (lineSummary?.lineTotalBeforeTax ?? originalAmount)
            )
        );
        const refundedQuantity = Math.max(
            0,
            Math.min(originalQuantity, Number(refundedQuantities[identifier] || 0))
        );
        const activeQuantity = roundMoney(originalQuantity - refundedQuantity);
        const refundedFinalAmount =
            refundedQuantity > 0
                ? roundMoney(
                      Number(refundedLineAmounts[identifier] || 0) ||
                          (originalQuantity > 0
                              ? (originalFinalAmount * refundedQuantity) /
                                originalQuantity
                              : 0)
                  )
                : 0;
        const activeFinalAmount = roundMoney(
            Math.max(0, originalFinalAmount - refundedFinalAmount)
        );
        const refundedOriginalAmount = roundMoney(baseUnitPrice * refundedQuantity);
        const activeOriginalAmount = roundMoney(baseUnitPrice * activeQuantity);
        const totalTaxAmount = roundMoney(
            Math.max(
                0,
                Number(line.lineTotalAfterTax || 0) - originalFinalAmount
            )
        );
        const activeLineTax =
            originalFinalAmount > 0
                ? roundMoney((totalTaxAmount * activeFinalAmount) / originalFinalAmount)
                : 0;
        const name = line.productName || fallbackItem?.product.name || '';

        if (activeQuantity > 0) {
            activeRows.push({
                identifier,
                quantity: activeQuantity,
                name,
                originalAmount: activeOriginalAmount,
                finalAmount: activeFinalAmount,
                discountDetails: buildReceiptDiscountDetailsForSavings(
                    cart,
                    lineSummary,
                    roundMoney(activeOriginalAmount - activeFinalAmount)
                ),
            });
            activeSubtotal = roundMoney(activeSubtotal + activeOriginalAmount);
            activeTotal = roundMoney(activeTotal + activeFinalAmount);
            activeTax = roundMoney(activeTax + activeLineTax);
        }

        if (refundedQuantity > 0) {
            refundedRows.push({
                identifier,
                quantity: refundedQuantity,
                name,
                originalAmount: refundedOriginalAmount,
                finalAmount: refundedFinalAmount,
                discountDetails: buildReceiptDiscountDetailsForSavings(
                    cart,
                    lineSummary,
                    roundMoney(refundedOriginalAmount - refundedFinalAmount)
                ),
            });
        }
    });

    return {
        sections: [
            {
                title: 'Active Items',
                emptyLabel: 'No active items',
                rows: activeRows,
            },
            {
                title: 'Refunded Items',
                emptyLabel: 'No refunded items',
                rows: refundedRows,
            },
        ],
        totals: {
            subtotal: activeSubtotal,
            discount: roundMoney(activeSubtotal - activeTotal),
            tax: activeTax,
            total: roundMoney(activeTotal + activeTax),
            orderDiscountDetails: [],
        },
    };
};

const buildReceiptDiscountDetailsForSavings = (
    cart: ReceiptCartState,
    lineSummary:
        | NonNullable<ReceiptCartState['appliedDiscountSummary']>['lineSummaries'][number]
        | undefined,
    targetSavings: number
): ReceiptDiscountDetailRow[] => {
    const roundedTargetSavings = roundMoney(Math.max(0, targetSavings));
    if (!lineSummary || roundedTargetSavings <= 0) {
        return [];
    }

    const sourceDetails: ReceiptDiscountDetailRow[] = [
        ...(lineSummary.discounts || []).map((discount) => ({
            label: discount.code || discount.name,
            amount: Number(discount.discountAmount || 0),
        })),
        ...buildAttributedOrderDiscountDetails(cart, lineSummary),
    ].filter((detail) => detail.amount > 0);

    const sourceTotal = roundMoney(
        sourceDetails.reduce((sum, detail) => sum + detail.amount, 0)
    );

    if (sourceTotal <= 0) {
        return [];
    }

    let remaining = roundedTargetSavings;
    return sourceDetails.map((detail, index) => {
        const isLast = index === sourceDetails.length - 1;
        const scaledAmount = isLast
            ? remaining
            : roundMoney((detail.amount / sourceTotal) * roundedTargetSavings);

        remaining = roundMoney(remaining - scaledAmount);

        return {
            label: detail.label,
            amount: scaledAmount,
        };
    });
};

const buildAttributedOrderDiscountDetails = (
    cart: ReceiptCartState,
    lineSummary: NonNullable<
        ReceiptCartState['appliedDiscountSummary']
    >['lineSummaries'][number]
): ReceiptDiscountDetailRow[] => {
    const allocatedTotal = roundMoney(
        Number(lineSummary.allocatedOrderDiscountTotal || 0)
    );
    const orderAdjustments =
        cart.appliedDiscountSummary?.orderLevelAdjustments || [];
    const sourceTotal = roundMoney(
        orderAdjustments.reduce(
            (sum, discount) => sum + Number(discount.discountAmount || 0),
            0
        )
    );

    if (allocatedTotal <= 0 || sourceTotal <= 0 || !orderAdjustments.length) {
        return [];
    }

    let remaining = allocatedTotal;
    return orderAdjustments.map((discount, index) => {
        const isLast = index === orderAdjustments.length - 1;
        const amount = isLast
            ? remaining
            : roundMoney(
                  (Number(discount.discountAmount || 0) / sourceTotal) *
                      allocatedTotal
              );
        remaining = roundMoney(remaining - amount);

        return {
            label: `Order · ${discount.code || discount.name}`,
            amount,
        };
    });
};

const getUnattributedOrderDiscountDetails = (
    cart: ReceiptCartState
): ReceiptDiscountDetailRow[] => {
    const orderAdjustments = cart.appliedDiscountSummary?.orderLevelAdjustments || [];
    const totalOrderAdjustments = roundMoney(
        orderAdjustments.reduce(
            (sum, discount) => sum + Number(discount.discountAmount || 0),
            0
        )
    );
    const allocatedOrderAdjustments = roundMoney(
        (cart.appliedDiscountSummary?.lineSummaries || []).reduce(
            (sum, summary) => sum + Number(summary.allocatedOrderDiscountTotal || 0),
            0
        )
    );
    const unattributedTotal = roundMoney(
        Math.max(0, totalOrderAdjustments - allocatedOrderAdjustments)
    );

    if (!orderAdjustments.length || unattributedTotal <= 0 || totalOrderAdjustments <= 0) {
        return [];
    }

    let remaining = unattributedTotal;
    return orderAdjustments.map((discount, index) => {
        const isLast = index === orderAdjustments.length - 1;
        const amount = isLast
            ? remaining
            : roundMoney(
                  (Number(discount.discountAmount || 0) / totalOrderAdjustments) *
                      unattributedTotal
              );
        remaining = roundMoney(remaining - amount);

        return {
            label: `Order · ${discount.code || discount.name}`,
            amount,
        };
    });
};

export const buildData = (
    builder: StarXpandCommand.StarXpandCommandBuilder
) => {
    // Create printing data using StarXpandCommandBuilder object.
    builder.addDocument(
        new StarXpandCommand.DocumentBuilder().addPrinter(
            new StarXpandCommand.PrinterBuilder()
                // .actionPrintImage(
                //     new StarXpandCommand.Printer.ImageParameter(
                //         'logo_01.png',
                //         406
                //     )
                // )
                .styleInternationalCharacter(
                    StarXpandCommand.Printer.InternationalCharacterType.Usa
                )
                .styleCharacterSpace(0)
                // .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                // .actionPrintText(
                //     'Star Clothing Boutique\n' +
                //         '123 Star Road\n' +
                //         'City, State 12345\n' +
                //         '\n'
                // )
                // .styleAlignment(StarXpandCommand.Printer.Alignment.Left)
                // .actionPrintText(
                //     'Date:MM/DD/YYYY    Time:HH:MM PM\n' +
                //         '--------------------------------\n' +
                //         '\n'
                // )
                // .actionPrintText(
                //     'SKU         Description    Total\n' +
                //         '300678566   PLAIN T-SHIRT  10.99\n' +
                //         '300692003   BLACK DENIM    29.99\n' +
                //         '300651148   BLUE DENIM     29.99\n' +
                //         '300642980   STRIPED DRESS  49.99\n' +
                //         '300638471   BLACK BOOTS    35.99\n' +
                //         '\n' +
                //         'Subtotal                  156.95\n' +
                //         'Tax                         0.00\n' +
                //         '--------------------------------\n'
                // )
                // .actionPrintText('Total     ')
                // .add(
                //     new StarXpandCommand.PrinterBuilder()
                //         .styleMagnification(
                //             new StarXpandCommand.MagnificationParameter(2, 2)
                //         )
                //         .actionPrintText('    $156.95\n')
                // )
                // .actionPrintText(
                //     '--------------------------------\n' +
                //         '\n' +
                //         'Charge\n' +
                //         '156.95\n' +
                //         'Visa XXXX-XXXX-XXXX-0123\n' +
                //         '\n'
                // )
                // .add(
                //     new StarXpandCommand.PrinterBuilder()
                //         .styleInvert(true)
                //         .actionPrintText('Refunds and Exchanges\n')
                // )
                // .actionPrintText('Within ')
                // .add(
                //     new StarXpandCommand.PrinterBuilder()
                //         .styleUnderLine(true)
                //         .actionPrintText('30 days')
                // )
                // .actionPrintText(' with receipt\n')
                // .actionPrintText('And tags attached\n' + '\n')
                .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                // .actionPrintBarcode(
                //     new StarXpandCommand.Printer.BarcodeParameter(
                //         '202090372801',
                //         StarXpandCommand.Printer.BarcodeSymbology.Ean13
                //     )
                //         .setBarDots(3)
                //         .setBarRatioLevel(
                //             StarXpandCommand.Printer.BarcodeBarRatioLevel.Level0
                //         )
                //         .setHeight(5)
                //         .setPrintHri(true)
                // )
                .actionFeedLine(1)
                .actionPrintQRCode(
                    new StarXpandCommand.Printer.QRCodeParameter(
                        'f01d8284-d231-4ffb-96e3-cc911568f8ae'
                    )
                        .setModel(StarXpandCommand.Printer.QRCodeModel.Model2)
                        .setLevel(StarXpandCommand.Printer.QRCodeLevel.L)
                        .setCellSize(8)
                )
                .actionFeedLine(1)
                .actionPrintText('f01d8284-d231-4ffb-96e3-cc911568f8ae')
                .actionCut(StarXpandCommand.Printer.CutType.Partial)
        )
    );
    // Get printing data from StarXpandCommandBuilder object.
    // var commands = await builder.getCommands();
};
