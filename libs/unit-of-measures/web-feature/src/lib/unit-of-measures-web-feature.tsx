import type { UnitOfMeasureEntity } from '../../../data-access/src/lib/unit-of-measure.entity';
import { DataTable, PageHeader } from '@pos/shared/ui-web';

export function UnitOfMeasuresWebFeature({ query, rows }: { query: string; rows: UnitOfMeasureEntity[] }) {
    const filteredRows = rows.filter((row) =>
        [row.name, row.description]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Units of Measure" description="Unit definitions reused from mobile catalog setup." />
            <DataTable
                title="Units"
                description="Product measurement options."
                emptyLabel="No units found."
                rows={filteredRows}
                getRowKey={(row) => row.id || row.name}
                columns={[
                    { key: 'name', header: 'Unit', render: (row) => row.name },
                    { key: 'description', header: 'Description', render: (row) => row.description || 'None' },
                ]}
            />
        </div>
    );
}
