jest.mock('@react-native-async-storage/async-storage', () => {
    let state = new Map<string, string>();

    return {
        setItem: jest.fn(async (key: string, value: string) => {
            state.set(key, value);
        }),
        getItem: jest.fn(async (key: string) => state.get(key) ?? null),
        removeItem: jest.fn(async (key: string) => {
            state.delete(key);
        }),
        multiSet: jest.fn(async (entries: string[][]) => {
            entries.forEach(([key, value]) => state.set(key, value));
        }),
        multiGet: jest.fn(async (keys: string[]) =>
            keys.map((key) => [key, state.get(key) ?? null])
        ),
        multiRemove: jest.fn(async (keys: string[]) => {
            keys.forEach((key) => state.delete(key));
        }),
        __reset: () => {
            state = new Map<string, string>();
        },
    };
});

jest.mock(
    'react-native-keychain',
    () => {
        let credentials: { username: string; password: string } | null = null;

        return {
            ACCESSIBLE: {
                WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
            },
            setGenericPassword: jest.fn(async (username: string, password: string) => {
                credentials = { username, password };
                return true;
            }),
            getGenericPassword: jest.fn(async () => credentials || false),
            resetGenericPassword: jest.fn(async () => {
                credentials = null;
                return true;
            }),
            __reset: () => {
                credentials = null;
            },
        };
    },
    { virtual: true }
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    clearRememberedAdminCredentials,
    getRememberedAdminCredentialStatus,
    getRememberedAdminCredentials,
    saveRememberedAdminCredentials,
} from './admin-credentials';

describe('remembered admin credentials', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (AsyncStorage as any).__reset?.();
        (require('react-native-keychain') as { __reset?: () => void }).__reset?.();
    });

    it('stores and reads remembered credentials', async () => {
        await saveRememberedAdminCredentials({
            username: 'owner@example.com',
            password: 'secret-123',
        });

        await expect(getRememberedAdminCredentials()).resolves.toEqual({
            username: 'owner@example.com',
            password: 'secret-123',
        });
        await expect(getRememberedAdminCredentialStatus()).resolves.toEqual({
            enabled: true,
            username: 'owner@example.com',
        });
    });

    it('reads remembered status without touching keychain credentials', async () => {
        await saveRememberedAdminCredentials({
            username: 'owner@example.com',
            password: 'secret-123',
        });

        jest.clearAllMocks();

        await expect(getRememberedAdminCredentialStatus()).resolves.toEqual({
            enabled: true,
            username: 'owner@example.com',
        });

        expect((require('react-native-keychain') as {
            getGenericPassword: jest.Mock;
        }).getGenericPassword).not.toHaveBeenCalled();
    });

    it('clears stored credentials and marker', async () => {
        await saveRememberedAdminCredentials({
            username: 'owner@example.com',
            password: 'secret-123',
        });

        await clearRememberedAdminCredentials();

        await expect(getRememberedAdminCredentials()).resolves.toBeNull();
        await expect(getRememberedAdminCredentialStatus()).resolves.toEqual({
            enabled: false,
        });
    });
});
