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
import type { OrderTicketPrintModel } from '@pos/orders/data-access';
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
    ticket: OrderTicketPrintModel
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
            copyType: ticket.copyType,
            orderNo: ticket.orderNo,
            receiptText: buildReceiptPreviewText(
                store,
                ticket,
                undefined,
                DEFAULT_RECEIPT_LAYOUT_PROFILE
            ),
        });
        return;
    }

    logReceiptTiming('print-receipt-start', {
        orderId: ticket.orderId,
        orderNo: ticket.orderNo,
        copyType: ticket.copyType,
        printerIdentifier: resolvedPrinterInfo.identifier,
    });
    await printSingleReceipt(store, resolvedPrinterInfo as PrinterEntity, ticket);
    logReceiptTiming('print-receipt-end', {
        orderId: ticket.orderId,
        orderNo: ticket.orderNo,
        copyType: ticket.copyType,
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
    ticket: OrderTicketPrintModel
) => {
    const date = new Date();
    const layoutProfile = isE2EPrinterSpyEnabled()
        ? resolveReceiptLayoutProfile({ model: printerInfo.model })
        : await detectReceiptLayoutProfile(printerInfo);
    const separatorLine = `${'-'.repeat(layoutProfile.totalColumns)}\n`;
    const receiptLines = buildReceiptLines(ticket, layoutProfile);
    const receiptTotalsBreakdown = buildReceiptTotalsBreakdownText(
        ticket,
        layoutProfile
    );
    const totalPaymentsText = getReceiptPaymentsText(ticket);
    const copyLabel = getReceiptCopyLabel(ticket);
    const receiptText = buildReceiptPreviewText(
        store,
        ticket,
        date,
        layoutProfile
    );

    if (isE2EPrinterSpyEnabled()) {
        recordE2EPrintJob({
            timestamp: date.toISOString(),
            printerIdentifier: printerInfo.identifier,
            orderId: ticket.orderId,
            orderNo: ticket.orderNo,
            copyType: ticket.copyType,
            copyLabel,
            total: ticket.totals.total,
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
                        `${formatReceiptCurrency(ticket.totals.total)}\n`
                    )
            )
            .styleAlignment(StarXpandCommand.Printer.Alignment.Left)
            .styleBold(true)
            .actionPrintText(
                ticket.promoCodes?.length
                    ? ticket.promoCodes
                          .map((promo) => `Promo · ${promo}`)
                          .join('\n') + '\n'
                    : ''
            )
            
        if (ticket.isReceipt && ticket.orderId) {
            printerBuilder
                .styleAlignment(StarXpandCommand.Printer.Alignment.Right)
                .actionPrintText(totalPaymentsText ? `${totalPaymentsText}\n` : '')
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
                        `${ticket.orderNo}\n`
                    )
                        .setModel(StarXpandCommand.Printer.QRCodeModel.Model2)
                        .setLevel(StarXpandCommand.Printer.QRCodeLevel.L)
                        .setCellSize(8)
                )
                .actionFeedLine(1)
                .actionPrintText(`${ticket.orderNo}\n`)
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

const getReceiptPaymentsText = (ticket: OrderTicketPrintModel) =>
    (ticket.paymentRows || [])
        .map((row) =>
            row.kind === 'heading'
                ? row.label
                : `${row.label}: ${formatPaymentCurrency(Number(row.amount || 0))}`
        )
        .join('\n');

const buildReceiptTotalsBreakdownText = (
    ticket: OrderTicketPrintModel,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const rows: string[] = [];
    const baseSubtotal = ticket.totals.subtotal;
    const discountTotal = ticket.totals.discount;
    const tax = ticket.totals.tax;

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
const formatPaymentCurrency = (amount: number) =>
    amount < 0
        ? `-$ ${Math.abs(amount).toFixed(2)}`
        : `$ ${amount.toFixed(2)}`;

const buildReceiptTotalsText = (
    ticket: OrderTicketPrintModel,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const rows = [buildReceiptTotalsBreakdownText(ticket, layoutProfile)];
    rows.push(`${'-'.repeat(layoutProfile.totalColumns)}\n`);
    rows.push(formatTotalRow('Total', ticket.totals.total, layoutProfile));

    if (ticket.promoCodes?.length) {
        rows.push(
            ticket.promoCodes.map((promo) => `Promo · ${promo}`).join('\n') + '\n'
        );
    }

    return rows.join('');
};

export const buildReceiptPreviewText = (
    store: ReceiptStoreInfo,
    ticket: OrderTicketPrintModel,
    date = new Date(),
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const receiptLines = buildReceiptLines(ticket, layoutProfile);
    const totalPaymentsText = getReceiptPaymentsText(ticket);
    const copyLabel = getReceiptCopyLabel(ticket);
    const totalText = buildReceiptTotalsText(ticket, layoutProfile);
    const footerText = ticket.isReceipt && ticket.orderId
        ? `${totalPaymentsText ? `${totalPaymentsText}\n\n` : ''}${store.disclaimer ?? ''}\n${copyLabel}\n${ticket.orderNo ?? ''}\n`
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

export const getReceiptCopyLabel = (ticket?: OrderTicketPrintModel) =>
    ticket?.copyType === 'CUSTOMER'
        ? '** Customer Copy **'
        : ticket?.copyType === 'MERCHANT'
        ? '** Merchant Copy **'
        : !ticket?.isReceipt
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
    row: OrderTicketPrintModel['sections'][number]['rows'][number],
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const lines = [formatLine(row.quantity, row.name, row.amount, layoutProfile)];

    for (const detailRow of row.detailRows || []) {
        const detailAmount = Number(detailRow.amount || 0);
        const amountText =
            detailAmount < 0
                ? `-${formatReceiptCurrency(Math.abs(detailAmount))}`
                : formatReceiptCurrency(detailAmount);
        const prefix = `${' '.repeat(layoutProfile.detailIndent)}${detailRow.label}`;
        lines.push(
            `${prefix.padEnd(
                Math.max(layoutProfile.totalColumns - amountText.length, prefix.length),
                ' '
            )}${amountText}`
        );
    }

    return lines.join('\n');
};

const buildClassicLines = (
    rows: OrderTicketPrintModel['sections'][number]['rows'],
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    return (
        `${buildReceiptHeaderRow(layoutProfile)}\n` +
        `${'-'.repeat(layoutProfile.totalColumns)}\n` +
        rows.map((row) => formatReceiptLineRow(row, layoutProfile)).join('\n') +
        '\n\n' +
        `${'-'.repeat(layoutProfile.totalColumns)}\n`
    );
};

const buildReceiptSection = (
    section: OrderTicketPrintModel['sections'][number],
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) =>
    `${section.title}\n` +
    `${buildReceiptHeaderRow(layoutProfile)}\n` +
    `${'-'.repeat(layoutProfile.totalColumns)}\n` +
    (section.rows.length
        ? section.rows
              .map((entry) => formatReceiptLineRow(entry, layoutProfile))
              .join('\n')
        : section.emptyLabel) +
    '\n\n';

export const buildReceiptLines = (
    ticket: OrderTicketPrintModel,
    layoutProfile: ReceiptLayoutProfile = DEFAULT_RECEIPT_LAYOUT_PROFILE
) => {
    const hasMultipleSections = ticket.sections.length > 1;

    if (hasMultipleSections) {
        return (
            ticket.sections
                .map((section) => buildReceiptSection(section, layoutProfile))
                .join('') + `${'-'.repeat(layoutProfile.totalColumns)}\n`
        );
    }

    return buildClassicLines(ticket.sections[0]?.rows || [], layoutProfile);
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
