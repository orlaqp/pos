import type { CategoryEntity } from '../../../data-access/src/lib/category.entity';
import { Badge, DataTable, PageHeader } from '@pos/shared/ui-web';

export function CategoriesWebFeature({ query, rows }: { query: string; rows: CategoryEntity[] }) {
    const filteredRows = rows.filter((row) =>
        [row.name, row.code, row.description]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Categories" description="Mobile category management recreated for web." />
            <DataTable
                title="Categories"
                description="Category code, description, and discount policy state."
                emptyLabel="No categories found."
                rows={filteredRows}
                getRowKey={(row) => row.id || row.name}
                columns={[
                    { key: 'name', header: 'Name', render: (row) => row.name },
                    { key: 'code', header: 'Code', render: (row) => row.code || 'Not set' },
                    { key: 'description', header: 'Description', render: (row) => row.description || 'None' },
                    {
                        key: 'discountable',
                        header: 'Discounts',
                        render: (row) => <Badge variant="outline">{row.discountable === false ? 'Blocked' : 'Allowed'}</Badge>,
                    },
                ]}
            />
        </div>
    );
}
