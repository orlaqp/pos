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
    paymentInfo?: {
        payments?: Array<{
            type: string;
            amount: number;
        }>;
    };
    lines?: Array<{
        quantity?: number;
        productName?: string;
        ebtPaidAmount?: number;
        nonEbtPaidAmount?: number;
    }>;
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
            receiptText: buildReceiptPreviewText(store, cart, order),
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
    const receiptLines = buildReceiptLines(cart, order);
    const receiptTotalsBreakdown = buildReceiptTotalsBreakdownText(cart);
    const totalPaymentsText = getReceiptPaymentsText(order);
    const copyLabel = getReceiptCopyLabel(order);
    const receiptText = buildReceiptPreviewText(store, cart, order, date);

    if (isE2EPrinterSpyEnabled()) {
        recordE2EPrintJob({
            timestamp: date.toISOString(),
            printerIdentifier: printerInfo.identifier,
            orderId: order?.id,
            orderNo: order?.orderNo,
            copyType: order?.copyType,
            copyLabel,
            total: cart.footer.total,
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
            .actionPrintText('Total\n')
            .add(
                new StarXpandCommand.PrinterBuilder()
                    .styleAlignment(StarXpandCommand.Printer.Alignment.Right)
                    .styleBold(true)
                    .styleMagnification(
                        new StarXpandCommand.MagnificationParameter(2, 2)
                    )
                    .actionPrintText(
                        `${formatReceiptCurrency(cart.footer.total)}\n`
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

const formatTotalRow = (label: string, amount: number) =>
    `${label.padEnd(18, ' ')}${amount.toFixed(2).padStart(14, ' ')}\n`;

const formatReceiptCurrency = (amount: number) => `$ ${amount.toFixed(2)}`;

const getReceiptDiscountDetails = (cart: ReceiptCartState) => {
    const lineDiscounts =
        cart.appliedDiscountSummary?.lineSummaries.flatMap((line) =>
            line.discounts.map((discount) => ({
                label: `Line · ${discount.name}`,
                amount: discount.discountAmount,
            }))
        ) ?? [];
    const orderDiscounts =
        cart.appliedDiscountSummary?.orderLevelAdjustments.map((discount) => ({
            label: `Order · ${discount.name}`,
            amount: discount.discountAmount,
        })) ?? [];

    return [...lineDiscounts, ...orderDiscounts].filter(
        (discount) => discount.amount > 0
    );
};

const buildReceiptTotalsBreakdownText = (cart: ReceiptCartState) => {
    const rows: string[] = [];
    const baseSubtotal =
        cart.footer.baseSubtotal ?? cart.footer.subtotal ?? cart.footer.total;
    const discountTotal =
        cart.footer.discount ?? cart.footer.savingsTotal ?? 0;
    const tax = cart.footer.tax ?? 0;

    rows.push(formatTotalRow('Subtotal', baseSubtotal));

    if (discountTotal > 0) {
        rows.push(formatTotalRow('Discounts', -discountTotal));
        getReceiptDiscountDetails(cart).forEach((discount) => {
            rows.push(formatTotalRow(discount.label, -discount.amount));
        });
    }

    if (tax > 0) {
        rows.push(formatTotalRow('Tax', tax));
    }

    rows.push('--------------------------------\n');

    return rows.join('');
};

const buildReceiptTotalsText = (cart: ReceiptCartState) => {
    const rows = [buildReceiptTotalsBreakdownText(cart)];
    rows.push(formatTotalRow('Total', cart.footer.total));

    if (cart.promoCodes?.length) {
        rows.push(
            cart.promoCodes.map((promo) => `Promo · ${promo.code}`).join('\n') +
                '\n'
        );
    }

    return rows.join('');
};

const getLineSummaryTotal = (
    cart: ReceiptCartState,
    item: ReceiptCartState['items'][number],
    index: number
) => {
    const itemIdentifier = item.identifier ?? `line-${index}`;
    const lineSummary = cart.appliedDiscountSummary?.lineSummaries.find(
        (summary) => summary.lineId === itemIdentifier
    );

    return lineSummary?.lineTotalBeforeTax ?? item.product.price * item.quantity;
};

export const buildReceiptPreviewText = (
    store: ReceiptStoreInfo,
    cart: ReceiptCartState,
    order?: ReceiptOrderEntity,
    date = new Date()
) => {
    const receiptLines = buildReceiptLines(cart, order);
    const totalPaymentsText = getReceiptPaymentsText(order);
    const copyLabel = getReceiptCopyLabel(order);
    const totalText = buildReceiptTotalsText(cart);
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

const formatLine = (qty: number, name: string, amount: number) =>
    `${formatQty(qty).padEnd(5, ' ')}  ${name.substring(0, 15).padEnd(15, ' ')}  ${amount.toFixed(2).padStart(7, ' ')}`;

export const getReceiptCopyLabel = (order?: ReceiptOrderEntity) =>
    order?.copyType === 'CUSTOMER'
        ? '** Customer Copy **'
        : order?.copyType === 'MERCHANT'
        ? '** Merchant Copy **'
        : order?.status === 'OPEN'
        ? '** Customer Copy **'
        : '** Merchant Copy **';

const buildClassicLines = (cart: ReceiptCartState) => {
    return (
        'Qty    Description        Total\n' +
        '-------------------------------\n' +
        cart.items
            .map((i, index) =>
                formatLine(
                    i.quantity,
                    i.product.name,
                    getLineSummaryTotal(cart, i, index)
                )
            )
            .join('\n') +
        '\n\n' +
        '--------------------------------\n'
    );
};

const buildEbtLines = (order: ReceiptOrderEntity) => {
    const lines = order.lines || [];
    const ebtLines = lines.filter((line) => (line?.ebtPaidAmount || 0) > 0);
    const nonEbtLines = lines.filter((line) => (line?.nonEbtPaidAmount || 0) > 0);

    const ebtTotal = ebtLines.reduce((acc, line) => acc + (line?.ebtPaidAmount || 0), 0);
    const nonEbtTotal = nonEbtLines.reduce(
        (acc, line) => acc + (line?.nonEbtPaidAmount || 0),
        0
    );

    return (
        'EBT Items\n' +
        'Qty    Description        Total\n' +
        '-------------------------------\n' +
        (ebtLines.length
            ? ebtLines
                  .map((line) => {
                      const isPartial =
                          (line?.ebtPaidAmount || 0) > 0 &&
                          (line?.nonEbtPaidAmount || 0) > 0;
                      const suffix = isPartial ? ' (partial)' : '';
                      return formatLine(
                          line?.quantity || 0,
                          `${line?.productName || ''}${suffix}`,
                          line?.ebtPaidAmount || 0
                      );
                  })
                  .join('\n')
            : 'No EBT-paid items') +
        `\nEBT Paid Total: $ ${ebtTotal.toFixed(2)}\n\n` +
        'Non-EBT Items\n' +
        'Qty    Description        Total\n' +
        '-------------------------------\n' +
        (nonEbtLines.length
            ? nonEbtLines
                  .map((line) => {
                      const isPartial =
                          (line?.ebtPaidAmount || 0) > 0 &&
                          (line?.nonEbtPaidAmount || 0) > 0;
                      const suffix = isPartial ? ' (partial)' : '';
                      return formatLine(
                          line?.quantity || 0,
                          `${line?.productName || ''}${suffix}`,
                          line?.nonEbtPaidAmount || 0
                      );
                  })
                  .join('\n')
            : 'No non-EBT-paid items') +
        `\nNon-EBT Paid Total: $ ${nonEbtTotal.toFixed(2)}\n\n` +
        '--------------------------------\n'
    );
};

export const buildReceiptLines = (cart: ReceiptCartState, order?: ReceiptOrderEntity) => {
    const hasEbtPayment = !!order?.paymentInfo?.payments?.some(
        (payment) => payment.type?.toUpperCase() === 'EBT'
    );

    if (!hasEbtPayment || !order?.lines?.length) {
        return buildClassicLines(cart);
    }

    return buildEbtLines(order);
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
