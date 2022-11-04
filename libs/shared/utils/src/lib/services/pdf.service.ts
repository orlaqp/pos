import RNHTMLtoPDF from 'react-native-html-to-pdf';

export class PDFService {

    static async create(html: string, fileName: string) {
        return await RNHTMLtoPDF.convert({ html, fileName, directory: 'Documents' });
    }

}