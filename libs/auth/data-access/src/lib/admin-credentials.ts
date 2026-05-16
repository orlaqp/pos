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

const readRememberedAdminMarker = async () => {
    const [enabled, username] = await Promise.all([
        AsyncStorage.getItem(REMEMBERED_ADMIN_ENABLED_KEY),
        AsyncStorage.getItem(REMEMBERED_ADMIN_USERNAME_KEY),
    ]);

    return {
        enabled: enabled === '1',
        username: username?.trim() || undefined,
    };
};

const setRememberedAdminMarker = async (username: string) => {
    await Promise.all([
        AsyncStorage.setItem(REMEMBERED_ADMIN_ENABLED_KEY, '1'),
        AsyncStorage.setItem(REMEMBERED_ADMIN_USERNAME_KEY, username),
    ]);
};

const clearRememberedAdminMarker = async () => {
    await Promise.all([
        AsyncStorage.removeItem(REMEMBERED_ADMIN_ENABLED_KEY),
        AsyncStorage.removeItem(REMEMBERED_ADMIN_USERNAME_KEY),
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
        const marker = await readRememberedAdminMarker();
        const isEnabled = marker.enabled;

        if (!isEnabled) {
            return null;
        }

        const keychain = getKeychainModule();
        const stored = await keychain.getGenericPassword(getKeychainOptions());

        if (!stored) {
            await clearRememberedAdminMarker();
            return null;
        }

        const username = stored.username?.trim() || marker.username || '';
        if (!username || !stored.password) {
            await clearRememberedAdminCredentials();
            return null;
        }

        if (username !== marker.username) {
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
        try {
            const marker = await readRememberedAdminMarker();
            if (!marker.enabled) {
                return { enabled: false };
            }

            return {
                enabled: true,
                username: marker.username,
            };
        } catch (error) {
            console.error('Unable to load remembered admin credential status', error);
            return { enabled: false };
        }
    };
