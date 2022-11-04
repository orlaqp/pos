import { ReportHeader } from './definitions';

const formatValue = (header: ReportHeader, value: string | number) => {
    switch (header.format) {
        case 'float':
            return value;
        case 'integer':
            return value;
        case 'money':
            return `$${(value as number).toFixed(2)}`;
        default:
            return value;
    }
}

const isNumber = (header: ReportHeader) => ['integer', 'float', 'money'].includes(header.format);

export function TableCell(header: ReportHeader, val: string | number, first: boolean, last: boolean) {
    return `<td style="${first ? 'padding-top: 10px;' : ''} ${isNumber(header) ? 'text-align: right;' : ''}"}>${formatValue(header, val)}</td>`;
}
