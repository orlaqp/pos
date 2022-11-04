import { ReportHeader } from './definitions';

const isNumber = (header: ReportHeader) => ['integer', 'float', 'money'].includes(header.format);

export function TableHeader(header: ReportHeader, first: boolean, last: boolean) {
    return `<th style="background-color: #ddd; font-size: 14px; padding-top: 10px; padding-bottom: 10px; ${isNumber(header) ? 'text-align: right;' : ''} ${first ? 'padding-left: 10px;' : ''} ${last ? 'padding-right: 10px;' : ''}"}>${header.label}</th>`;
}
