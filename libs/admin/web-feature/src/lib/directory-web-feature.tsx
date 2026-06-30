'use client';

import { Building2, ClipboardList, Contact, Store, Users } from 'lucide-react';
import { useMemo } from 'react';
import {
    ADMIN_ROUTES,
    AdminDirectoryData,
    AdminRouteId,
    CatalogVendor,
    DirectoryCompany,
    DirectoryContact,
} from '@pos/admin/data-access';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DataTable,
    PageHeader,
} from '@pos/shared/ui-web';

type DirectoryWebFeatureProps = {
    directory: AdminDirectoryData;
    query: string;
    route: AdminRouteId;
    onRouteChange: (route: AdminRouteId) => void;
};

export function DirectoryWebFeature({
    directory,
    query,
    route,
    onRouteChange,
}: DirectoryWebFeatureProps) {
    if (route === ADMIN_ROUTES.directoryContacts) {
        return <ContactList contacts={directory.contacts} query={query} />;
    }

    if (route === ADMIN_ROUTES.directoryCompanies) {
        return <CompanyList companies={directory.companies} contacts={directory.contacts} query={query} />;
    }

    if (route === ADMIN_ROUTES.catalogVendors) {
        return (
            <VendorList
                companies={directory.companies}
                contacts={directory.contacts}
                query={query}
                vendors={directory.vendors}
            />
        );
    }

    return <DirectoryDashboard directory={directory} onRouteChange={onRouteChange} />;
}

function DirectoryDashboard({
    directory,
    onRouteChange,
}: {
    directory: AdminDirectoryData;
    onRouteChange: (route: AdminRouteId) => void;
}) {
    const recordsToReview = useMemo(() => countReviewRecords(directory), [directory]);

    const cards = [
        {
            id: 'contacts',
            title: 'People records',
            value: directory.contacts.length,
            detail: 'Contacts available for sales, work, and service flows.',
            icon: Contact,
            action: 'Open contacts',
            route: ADMIN_ROUTES.directoryContacts,
        },
        {
            id: 'companies',
            title: 'Organizations',
            value: directory.companies.length,
            detail: 'Companies and accounts connected to workspace activity.',
            icon: Building2,
            action: 'Open companies',
            route: ADMIN_ROUTES.directoryCompanies,
        },
        {
            id: 'vendors',
            title: 'Catalog vendors',
            value: directory.vendors.length,
            detail: 'Vendor records used by catalog purchasing and receiving.',
            icon: Store,
            action: 'Open catalog vendors',
            route: ADMIN_ROUTES.catalogVendors,
        },
        {
            id: 'review',
            title: 'Records to review',
            value: recordsToReview,
            detail: 'Directory entries missing ownership or core details.',
            icon: ClipboardList,
            action: 'Review records',
            route: ADMIN_ROUTES.directoryContacts,
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Directory dashboard"
                description="Review shared people, organization, and vendor records that other BinSuite modules rely on."
                action={
                    <Button onClick={() => onRouteChange(ADMIN_ROUTES.directoryContacts)}>
                        <Users className="mr-2" />
                        Open contacts
                    </Button>
                }
            />
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <Card key={card.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <Icon className="text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tabular-nums">{card.value}</div>
                                <p className="mt-1 min-h-10 text-sm text-muted-foreground">{card.detail}</p>
                                <Button
                                    className="mt-4"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onRouteChange(card.route)}
                                >
                                    {card.action}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>
        </div>
    );
}

function ContactList({ contacts, query }: { contacts: DirectoryContact[]; query: string }) {
    const rows = contacts.filter((contact) =>
        [contact.name, contact.email, contact.phone, contact.role]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Contacts"
                description="People records shared across sales, service, and purchasing workflows."
            />
            <DataTable
                title="Contacts"
                emptyLabel="No contacts found."
                rows={rows}
                getRowKey={(row) => row.id}
                columns={[
                    { key: 'name', header: 'Name', render: (row) => row.name },
                    { key: 'email', header: 'Email', render: (row) => row.email || 'Not set' },
                    { key: 'phone', header: 'Phone', render: (row) => row.phone || 'Not set' },
                    { key: 'role', header: 'Role', render: (row) => row.role || 'Not set' },
                    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                ]}
            />
        </div>
    );
}

function CompanyList({
    companies,
    contacts,
    query,
}: {
    companies: DirectoryCompany[];
    contacts: DirectoryContact[];
    query: string;
}) {
    const rows = companies.filter((company) =>
        [company.name, company.type, contactName(contacts, company.primaryContactId)]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Companies"
                description="Organizations and accounts connected to workspace activity."
            />
            <DataTable
                title="Companies"
                emptyLabel="No companies found."
                rows={rows}
                getRowKey={(row) => row.id}
                columns={[
                    { key: 'name', header: 'Company', render: (row) => row.name },
                    { key: 'type', header: 'Type', render: (row) => row.type || 'Not set' },
                    {
                        key: 'contact',
                        header: 'Primary contact',
                        render: (row) => contactName(contacts, row.primaryContactId) || 'Not set',
                    },
                    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                ]}
            />
        </div>
    );
}

function VendorList({
    companies,
    contacts,
    query,
    vendors,
}: {
    companies: DirectoryCompany[];
    contacts: DirectoryContact[];
    query: string;
    vendors: CatalogVendor[];
}) {
    const rows = vendors.filter((vendor) =>
        [
            vendor.name,
            companyName(companies, vendor.companyId),
            contactName(contacts, vendor.primaryContactId),
            vendor.terms,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Catalog vendors"
                description="Vendor records used by catalog purchasing and receiving."
            />
            <DataTable
                title="Catalog Vendors"
                emptyLabel="No catalog vendors found."
                rows={rows}
                getRowKey={(row) => row.id}
                columns={[
                    { key: 'name', header: 'Vendor', render: (row) => row.name },
                    {
                        key: 'company',
                        header: 'Company',
                        render: (row) => companyName(companies, row.companyId) || 'Not set',
                    },
                    {
                        key: 'contact',
                        header: 'Primary contact',
                        render: (row) => contactName(contacts, row.primaryContactId) || 'Not set',
                    },
                    { key: 'terms', header: 'Terms', render: (row) => row.terms || 'Not set' },
                    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                ]}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: 'active' | 'review' }) {
    return (
        <Badge variant={status === 'active' ? 'secondary' : 'outline'}>
            {status === 'active' ? 'Active' : 'Review'}
        </Badge>
    );
}

function countReviewRecords(directory: AdminDirectoryData) {
    return (
        directory.contacts.filter((contact) => contact.status === 'review' || !contact.email || !contact.companyId).length +
        directory.companies.filter((company) => company.status === 'review' || !company.type || !company.primaryContactId).length +
        directory.vendors.filter((vendor) => vendor.status === 'review' || !vendor.companyId || !vendor.primaryContactId).length
    );
}

function contactName(contacts: DirectoryContact[], contactId: string | null) {
    return contacts.find((contact) => contact.id === contactId)?.name || null;
}

function companyName(companies: DirectoryCompany[], companyId: string | null) {
    return companies.find((company) => company.id === companyId)?.name || null;
}
