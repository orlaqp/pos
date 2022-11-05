import { ReportHeader } from './definitions';
import { TableCell } from './table-cell';
import { TableHeader } from './table-header';

export const TableLayout = {
    compact: '5px',
    comfortable: '10px'
}

/* eslint-disable-next-line */
export interface HtmlTableProps {
    headers: ReportHeader[];
    items?: any[];
    spacing: keyof (typeof TableLayout);
}

export function HtmlTable({ items, headers, spacing = 'compact' }: HtmlTableProps) {
    if (!items.length) return null;

    const headerCount = headers.length - 1;
    const itemsCount = items.length - 1;

    return `
    <table>
        <thead>
            <tr>
            ${headers.map((h, idx) => TableHeader(h, idx === 0, idx === headerCount)).join('\n')}
            </tr>
        </thead>
        <tbody>
            ${items.map((i, idx) => `
            <tr style="padding-bottom: ${TableLayout[spacing]};">
                ${headers.map((h) => TableCell(h, i[h.field], idx === 0, idx === itemsCount)).join('\n')}
            </tr>
            `).join('\n')}
        </tbody>
    </table>
    `;
}
