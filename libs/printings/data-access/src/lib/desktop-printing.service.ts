import * as RNPrint from 'react-native-print';

export class DesktopPrintingService {

    static selectPrinter = async () => {
        const selectedPrinter = await RNPrint.default.selectPrinter({ x: 1000, y: 100 })
        return selectedPrinter;
    }

    static async printHTML(html: string) {
        await RNPrint.default.print({ html });
    }

    static async printPDF(filePath: string) {
        await RNPrint.default.print({ filePath: filePath });
    }

}