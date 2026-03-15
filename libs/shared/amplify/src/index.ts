import { Amplify } from 'aws-amplify';
import {
    signIn,
    signOut,
    signUp,
    getCurrentUser,
    fetchUserAttributes,
    fetchAuthSession,
} from 'aws-amplify/auth';
import { getUrl, remove, uploadData, downloadData } from 'aws-amplify/storage';
import { GraphQLResult } from '@aws-amplify/api-graphql';

type SignUpRequest = {
    username: string;
    password: string;
    attributes?: Record<string, string | undefined>;
};

type StorageGetOptions = {
    download?: boolean;
};

type LegacyStorageDownloadResult = {
    Body: Blob;
};

const getApiClient = () => require('aws-amplify/api').generateClient();
const getDataStoreModule = () => require('@aws-amplify/datastore');
const getHubModule = () => require('aws-amplify/utils');

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    ) {
        return (error as { message: string }).message;
    }

    return String(error);
};

const normalizeAuthError = (error: unknown) => {
    if (
        error &&
        typeof error === 'object' &&
        'underlyingError' in error &&
        (error as { underlyingError?: unknown }).underlyingError
    ) {
        return (error as { underlyingError: unknown }).underlyingError;
    }

    return error;
};

const toLegacyUser = async () => {
    const currentUser = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    const session = await fetchAuthSession();

    return {
        username: currentUser.username,
        attributes: {
            sub: currentUser.userId,
            ...attributes,
        },
        signInUserSession: {
            accessToken: {
                payload: session.tokens?.accessToken?.payload || {},
            },
        },
    };
};

export const Auth = {
    async signIn(username: string, password: string) {
        try {
            const result = await signIn({
                username,
                password,
            });

            if (!result.isSignedIn) {
                const signInStep =
                    result.nextStep?.signInStep || 'UNKNOWN_SIGN_IN_STEP';
                throw new Error(`Sign-in is not complete: ${signInStep}`);
            }

            return await toLegacyUser();
        } catch (error) {
            throw normalizeAuthError(error);
        }
    },
    async signUp({ username, password, attributes }: SignUpRequest) {
        return signUp({
            username,
            password,
            options: attributes ? { userAttributes: attributes } : undefined,
        });
    },
    async signOut() {
        return signOut();
    },
    async currentAuthenticatedUser() {
        try {
            return await toLegacyUser();
        } catch (error) {
            throw normalizeAuthError(error);
        }
    },
};

async function storagePut(key: string, data: Blob | ArrayBuffer | ArrayBufferView | string) {
    const result = await uploadData({
        key,
        data,
        options: {
            accessLevel: 'guest',
        },
    }).result;

    return {
        key: result.key,
    };
}

async function storageGet(key: string): Promise<string>;
async function storageGet(key: string, options: { download: false }): Promise<string>;
async function storageGet(key: string, options: { download: true }): Promise<LegacyStorageDownloadResult>;
async function storageGet(key: string, options?: StorageGetOptions): Promise<string | LegacyStorageDownloadResult> {
    if (options?.download) {
        const result = await downloadData({
            key,
            options: {
                accessLevel: 'guest',
            },
        }).result;
        const body = result.body as unknown as Blob & { blob?: () => Promise<Blob> };
        const normalizedBody =
            typeof body?.blob === 'function' ? await body.blob() : body;

        return {
            Body: normalizedBody,
        };
    }

    const result = await getUrl({
        key,
        options: {
            accessLevel: 'guest',
        },
    });

    return result.url.toString();
}

async function storageRemove(key: string) {
    return remove({
        key,
        options: {
            accessLevel: 'guest',
        },
    });
}

export const Storage = {
    put: storagePut,
    get: storageGet,
    remove: storageRemove,
};

export const API = {
    graphql<T>(options: Record<string, unknown>) {
        return getApiClient().graphql(options as never) as Promise<GraphQLResult<T>>;
    },
};

export const DataStore = {
    query: (...args: unknown[]) => getDataStoreModule().DataStore.query(...args),
    save: (...args: unknown[]) => getDataStoreModule().DataStore.save(...args),
    delete: (...args: unknown[]) => getDataStoreModule().DataStore.delete(...args),
    observe: (...args: unknown[]) => getDataStoreModule().DataStore.observe(...args),
    observeQuery: (...args: unknown[]) => getDataStoreModule().DataStore.observeQuery(...args),
    start: (...args: unknown[]) => getDataStoreModule().DataStore.start(...args),
    stop: (...args: unknown[]) => getDataStoreModule().DataStore.stop(...args),
    clear: (...args: unknown[]) => getDataStoreModule().DataStore.clear(...args),
    configure: (...args: unknown[]) => getDataStoreModule().DataStore.configure(...args),
};

export const Hub = {
    listen: (...args: unknown[]) => getHubModule().Hub.listen(...args),
};

export const syncExpression = (...args: unknown[]) =>
    getDataStoreModule().syncExpression(...args);

export { Amplify };
