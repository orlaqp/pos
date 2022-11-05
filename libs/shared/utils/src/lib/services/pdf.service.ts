import * as HTMLtoPDF from 'react-native-html-to-pdf';

export class PDFService {

    static async create(html: string, fileName: string) {
        console.log('====================================');
        console.log(html);
        console.log('====================================');
        debugger;
        return await (HTMLtoPDF as any).default.convert({ html, fileName, directory: 'Documents' });
    }

}