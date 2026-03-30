import AsyncStorage from '@react-native-async-storage/async-storage';

const MANUAL_SIGN_OUT_KEY = 'manual-sign-out-v1';

export const markManualSignOut = async () => {
    try {
        await AsyncStorage.setItem(MANUAL_SIGN_OUT_KEY, '1');
    } catch {
        // Best-effort session guard.
    }
};

export const clearManualSignOut = async () => {
    try {
        await AsyncStorage.removeItem(MANUAL_SIGN_OUT_KEY);
    } catch {
        // Best-effort session guard.
    }
};

export const readManualSignOut = async () => {
    try {
        return (await AsyncStorage.getItem(MANUAL_SIGN_OUT_KEY)) === '1';
    } catch {
        return false;
    }
};
