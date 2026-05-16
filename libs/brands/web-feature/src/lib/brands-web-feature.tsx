import type { BrandEntity } from '../../../data-access/src/lib/brand.entity';
import { DataTable, PageHeader } from '@pos/shared/ui-web';

export function BrandsWebFeature({ query, rows }: { query: string; rows: BrandEntity[] }) {
    const filteredRows = rows.filter((row) =>
        [row.name, row.description]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Brands" description="Brand definitions reused from the mobile brand feature." />
            <DataTable
                title="Brands"
                description="Tenant brand catalog."
                emptyLabel="No brands found."
                rows={filteredRows}
                getRowKey={(row) => row.id || row.name}
                columns={[
                    { key: 'name', header: 'Name', render: (row) => row.name },
                    { key: 'description', header: 'Description', render: (row) => row.description || 'None' },
                ]}
            />
        </div>
    );
}
