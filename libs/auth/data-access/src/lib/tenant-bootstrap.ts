import { API } from '@pos/shared/amplify';
import {
    clearCurrentTenantContext,
    setCurrentTenantContext,
} from './tenant-context';
import { User } from './auth.slice';

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

const isGraphqlConflict = (error: unknown) => {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error);

    return (
        message.includes('ConditionalCheckFailedException') ||
        message.includes('The conditional request failed') ||
        message.includes('already exists')
    );
};

const createIfMissing = async (input: {
    query: string;
    variables: Record<string, unknown>;
}) => {
    try {
        await API.graphql({
            query: input.query,
            variables: input.variables,
            authMode: 'userPool',
        });
    } catch (error) {
        if (isGraphqlConflict(error)) {
            return;
        }

        throw error;
    }
};

const buildTenantUserMembershipId = (tenantId: string, userId: string) =>
    `${tenantId}::tenant-user::${userId}`;

const ensureTenantRecord = async (user: User) => {
    const tenantId = user.tenantId;
    const businessName = defaultBusinessName(user);

    await createIfMissing({
        query: createTenantMutation,
        variables: {
            input: {
                id: tenantId,
                name: businessName,
                slug: slugify(businessName) || tenantId,
                ownerUserId: user.id,
            },
        }
    });

    await createIfMissing({
        query: createTenantUserMutation,
        variables: {
            input: {
                id: buildTenantUserMembershipId(tenantId, user.id),
                tenantId,
                userId: user.id,
                role: 'OWNER',
            },
        }
    });
};

export const bootstrapTenantSession = async (user: User) => {
    setCurrentTenantContext({
        tenantId: user.tenantId,
        businessName: defaultBusinessName(user),
    });

    try {
        await ensureTenantRecord(user);
    } catch (error) {
        clearCurrentTenantContext();
        throw error;
    }
};
