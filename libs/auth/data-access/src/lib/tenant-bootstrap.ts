import { API, DataStore } from '@pos/shared/amplify';
import { GlobalSettings, Store } from '@pos/shared/models';
import {
    clearCurrentTenantContext,
    setCurrentTenantContext,
    stampTenant,
} from './tenant-context';
import { User } from './auth.slice';

const getTenantQuery = /* GraphQL */ `
  query GetTenant($id: ID!) {
    getTenant(id: $id) {
      id
      name
      slug
      ownerUserId
    }
  }
`;

const createTenantMutation = /* GraphQL */ `
  mutation CreateTenant($input: CreateTenantInput!) {
    createTenant(input: $input) {
      id
      name
      slug
      ownerUserId
    }
  }
`;

const listTenantUsersQuery = /* GraphQL */ `
  query ListTenantUsers($filter: ModelTenantUserFilterInput) {
    listTenantUsers(filter: $filter, limit: 1) {
      items {
        id
        tenantId
        userId
        role
      }
    }
  }
`;

const createTenantUserMutation = /* GraphQL */ `
  mutation CreateTenantUser($input: CreateTenantUserInput!) {
    createTenantUser(input: $input) {
      id
      tenantId
      userId
      role
    }
  }
`;

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);

const defaultBusinessName = (user: User) =>
    user.businessName?.trim() || user.name?.trim() || 'New Business';

const ensureTenantRecord = async (user: User) => {
    const tenantId = user.tenantId;
    const businessName = defaultBusinessName(user);
    const existing = await API.graphql<{ getTenant?: { id: string } | null }>({
        query: getTenantQuery,
        variables: { id: tenantId },
        authMode: 'userPool',
    });

    if (!existing.data?.getTenant) {
        await API.graphql({
            query: createTenantMutation,
            variables: {
                input: {
                    id: tenantId,
                    name: businessName,
                    slug: slugify(businessName) || tenantId,
                    ownerUserId: user.id,
                },
            },
            authMode: 'userPool',
        });
    }

    const memberships = await API.graphql<{
        listTenantUsers?: {
            items?: Array<{ id: string; tenantId: string; userId: string } | null> | null;
        } | null;
    }>({
        query: listTenantUsersQuery,
        variables: {
            filter: {
                and: [{ tenantId: { eq: tenantId } }, { userId: { eq: user.id } }],
            },
        },
        authMode: 'userPool',
    });

    if (!memberships.data?.listTenantUsers?.items?.length) {
        await API.graphql({
            query: createTenantUserMutation,
            variables: {
                input: {
                    tenantId,
                    userId: user.id,
                    role: 'OWNER',
                },
            },
            authMode: 'userPool',
        });
    }
};

const ensureDefaultStore = async (user: User) => {
    const stores = await DataStore.query(Store);

    if (stores.length) {
        return;
    }

    await DataStore.save(
        new Store(
            stampTenant({
                name: defaultBusinessName(user),
                address: 'Update in settings',
                city: 'Update in settings',
                state: 'NA',
                zipCode: '00000',
                country: 'US',
                phone: '000-000-0000',
                email: user.email,
                fax: '',
                disclaimer: '',
            }) as never
        )
    );
};

const ensureDefaultGlobalSettings = async () => {
    const settings = await DataStore.query(GlobalSettings);

    if (settings.length) {
        return;
    }

    await DataStore.save(
        new GlobalSettings(
            stampTenant({
                enforceSalesBasedOnInventory: false,
            }) as never
        )
    );
};

export const bootstrapTenantSession = async (user: User) => {
    setCurrentTenantContext({
        tenantId: user.tenantId,
        businessName: defaultBusinessName(user),
    });

    try {
        await ensureTenantRecord(user);
        await ensureDefaultStore(user);
        await ensureDefaultGlobalSettings();
    } catch (error) {
        clearCurrentTenantContext();
        throw error;
    }
};
