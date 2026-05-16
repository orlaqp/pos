import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export type DataTableColumn<TRow> = {
    key: string;
    header: string;
    render: (row: TRow) => ReactNode;
};

type DataTableProps<TRow> = {
    columns: DataTableColumn<TRow>[];
    description?: string;
    emptyLabel: string;
    getRowKey: (row: TRow) => string;
    rows: TRow[];
    title: string;
};

export function DataTable<TRow>({
    columns,
    description,
    emptyLabel,
    getRowKey,
    rows,
    title,
}: DataTableProps<TRow>) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
            </CardHeader>
            <CardContent>
                {rows.length ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead key={column.key}>{column.header}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={getRowKey(row)}>
                                    {columns.map((column) => (
                                        <TableCell key={column.key}>{column.render(row)}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
                )}
            </CardContent>
        </Card>
    );
}
