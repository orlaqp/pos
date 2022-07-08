import { StoreInfoEntity } from '@pos/store-info/data-access';
import { CartState } from '@pos/sales/data-access';
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
import { OrderEntity } from '@pos/orders/data-access';

let starManager: StarDeviceDiscoveryManager;

export const discoverStarPrinters = async (): Promise<StarPrinter[]> => {
    return new Promise((resolve, reject) => {
        const printers: StarPrinter[] = [];
        // Specify your printer interface types.
        StarDeviceDiscoveryManagerFactory.create([
            InterfaceType.Lan,
            // InterfaceType.Bluetooth,
            // InterfaceType.BluetoothLE,
            // InterfaceType.Usb
        ])
            .then((manager) => {
                starManager = manager;
                // Set discovery time. (option)
                manager.discoveryTime = 10000;

                // Callback for printer found.
                manager.onPrinterFound = (printer: StarPrinter) => {
                    printers.push(printer);
                    console.log(printer);
                };

                // Callback for discovery finished. (option)
                manager.onDiscoveryFinished = () => {
                    resolve(printers);
                    console.log(`Discovery finished.`);
                };

                // Start discovery.
                manager.startDiscovery();

                // Stop discovery.
                // await manager.stopDiscovery()
                return printers;
            })
            .catch((error) => {
                console.error('Error while searching for printers', error);
            });
    });
};

export const stopDiscovery = () => {
    starManager.stopDiscovery();
};

export const printReceipt = async (
    store: StoreInfoEntity,
    printerInfo: PrinterEntity,
    cart: CartState,
    order?: OrderEntity,
) => {
    debugger;
    if (!store || !printerInfo) {
        Alert.alert('Store and printer should be available in order to print');
        return;
    }

    // TODO: Restore printing service
    // return;

    // return print(printerInfo, (builder) => buildData(builder));

    print(printerInfo, (builder) => {
        const date = new Date();

        const printerBuilder = new StarXpandCommand.PrinterBuilder()
            .styleInternationalCharacter(
                StarXpandCommand.Printer.InternationalCharacterType.Usa
            )
            .styleCharacterSpace(0)
            .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
            .styleBold(true)
            .actionPrintText(`${store.name}\n`)
            // .styleBold(false)
            .actionPrintText(
                `${store.address}\n${store.city}, ${store.state} ${store.zipCode}\nP: ${store.phone}\nF: ${store.fax}\n${store.email}\n\n`
            )
            .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
            .actionPrintText(
                `Date:${date.toLocaleString()}\n` +
                    // '--------------------------------\n' +
                    '\n'
            )
            .styleAlignment(StarXpandCommand.Printer.Alignment.Left)
            .actionPrintText(
                // 'SKU   Description        Total\n' +
                'Description        Qty    Total\n' +
                '-------------------------------\n' +
                    // cart.items.map(i => `${i.product.sku?.padEnd(5, ' ')} ${i.quantity.toString().padStart(2, ' ')}x${i.product.name.substring(0, 13).padEnd(13, ' ')} ${(i.product.price * i.quantity).toFixed(2).padStart(7, ' ')}`).join('\n') +
                    cart.items
                        .map((i) =>
                                `${i.product.name.substring(0, 15).padEnd(15, ' ')}  ${(i.quantity % 1 === 0 ? i.quantity.toString() : i.quantity.toFixed(2)).padStart(5, ' ')}  ${(i.product.price * i.quantity).toFixed(2).padStart(7, ' ')}`
                        )
                        .join('\n') +
                    '\n\n' +
                    // `Subtotal                 ${cart.footer.subtotal.toFixed(2).padStart(7, ' ')}\n` +
                    // 'Tax                         0.00\n' +
                    '--------------------------------\n'
            )
            .actionPrintText('Total     ')
            .add(
                new StarXpandCommand.PrinterBuilder()
                    .styleMagnification(
                        new StarXpandCommand.MagnificationParameter(2, 2)
                    )
                    .actionPrintText(
                        `     ${cart.footer.total.toFixed(2).padStart(7, '')}\n`
                    )
            )
            .actionPrintText('--------------------------------\n')
            .actionFeedLine(1);            

        if (order?.id) {
            printerBuilder
                .add(
                    new StarXpandCommand.PrinterBuilder()
                        .styleInvert(true)
                        .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                        .actionPrintText(` ${store.disclaimer} \n`)
                )
                .actionFeedLine(1)
                .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                .actionPrintText(
                    cart.footer.payments?.map(p => `${p.type}: ${p.amount}`).join('\n') || ''
                )
                .actionPrintText(order.status === 'OPEN' ? '** Customer Copy **' : '** Merchant Copy **')
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
    // Specify your printer connection settings.
    const settings = new StarConnectionSettings();
    settings.interfaceType = InterfaceType.Lan;
    settings.identifier = printerInfo.identifier; // '0011621BF5B2';
    const printer = new StarPrinter(settings);

    try {
        // Connect to the printer.
        await printer.open();

        // create printing data. (Please refer to 'Create Printing data')
        const builder = new StarXpandCommand.StarXpandCommandBuilder();
        dataBuilder(builder);
        const commands = await builder.getCommands();

        // Print.
        await printer.print(commands);
    } catch (error) {
        // Error.
        console.log(error);
    } finally {
        // Disconnect from the printer and dispose object.
        await printer.close();
        await printer.dispose();
    }
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
