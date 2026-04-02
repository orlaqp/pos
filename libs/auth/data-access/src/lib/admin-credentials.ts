import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBERED_ADMIN_ENABLED_KEY = 'remembered-admin-login-enabled-v1';
const REMEMBERED_ADMIN_USERNAME_KEY = 'remembered-admin-login-username-v1';
const REMEMBERED_ADMIN_KEYCHAIN_SERVICE = 'pos.remembered-admin-login';

export type RememberedAdminCredentials = {
    username: string;
    password: string;
};

export type RememberedAdminCredentialStatus = {
    enabled: boolean;
    username?: string;
};

const getKeychainModule = () =>
    require('react-native-keychain') as {
        ACCESSIBLE?: {
            WHEN_UNLOCKED_THIS_DEVICE_ONLY?: string;
        };
        getGenericPassword: (options?: Record<string, unknown>) => Promise<
            false | { username: string; password: string }
        >;
        resetGenericPassword: (options?: Record<string, unknown>) => Promise<boolean>;
        setGenericPassword: (
            username: string,
            password: string,
            options?: Record<string, unknown>
        ) => Promise<unknown>;
    };

const getKeychainOptions = () => {
    const keychain = getKeychainModule();

    return {
        service: REMEMBERED_ADMIN_KEYCHAIN_SERVICE,
        accessible: keychain.ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    };
};

const setRememberedAdminMarker = async (username: string) => {
    await AsyncStorage.multiSet([
        [REMEMBERED_ADMIN_ENABLED_KEY, '1'],
        [REMEMBERED_ADMIN_USERNAME_KEY, username],
    ]);
};

const clearRememberedAdminMarker = async () => {
    await AsyncStorage.multiRemove([
        REMEMBERED_ADMIN_ENABLED_KEY,
        REMEMBERED_ADMIN_USERNAME_KEY,
    ]);
};

export const saveRememberedAdminCredentials = async (
    credentials: RememberedAdminCredentials
) => {
    const username = credentials.username.trim();
    const password = credentials.password;

    if (!username || !password) {
        throw new Error('Username and password are required to save this login.');
    }

    const keychain = getKeychainModule();
    await keychain.setGenericPassword(username, password, getKeychainOptions());
    await setRememberedAdminMarker(username);
};

export const clearRememberedAdminCredentials = async () => {
    try {
        const keychain = getKeychainModule();
        await keychain.resetGenericPassword(getKeychainOptions());
    } finally {
        await clearRememberedAdminMarker();
    }
};

export const getRememberedAdminCredentials = async (): Promise<RememberedAdminCredentials | null> => {
    try {
        const [enabled, usernameHint] = await AsyncStorage.multiGet([
            REMEMBERED_ADMIN_ENABLED_KEY,
            REMEMBERED_ADMIN_USERNAME_KEY,
        ]);
        const isEnabled = enabled?.[1] === '1';

        if (!isEnabled) {
            return null;
        }

        const keychain = getKeychainModule();
        const stored = await keychain.getGenericPassword(getKeychainOptions());

        if (!stored) {
            await clearRememberedAdminMarker();
            return null;
        }

        const username = stored.username?.trim() || usernameHint?.[1]?.trim() || '';
        if (!username || !stored.password) {
            await clearRememberedAdminCredentials();
            return null;
        }

        if (username !== usernameHint?.[1]) {
            await setRememberedAdminMarker(username);
        }

        return {
            username,
            password: stored.password,
        };
    } catch (error) {
        console.error('Unable to load remembered admin credentials', error);
        return null;
    }
};

export const getRememberedAdminCredentialStatus =
    async (): Promise<RememberedAdminCredentialStatus> => {
        const remembered = await getRememberedAdminCredentials();

        if (!remembered) {
            return { enabled: false };
        }

        return {
            enabled: true,
            username: remembered.username,
        };
    };
