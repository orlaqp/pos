import AsyncStorage from '@react-native-async-storage/async-storage';

export type PinLockState = {
    failedAttempts: number;
    lockedUntil: number | null;
};

export const PIN_LOCK_STORAGE_KEY = 'pin-lock-state-v1';
export const MAX_PIN_ATTEMPTS = 3;
export const PIN_LOCK_DURATION_MS = 5 * 60 * 1000;

export const readPinLockState = async (): Promise<PinLockState> => {
    try {
        const raw = await AsyncStorage.getItem(PIN_LOCK_STORAGE_KEY);
        if (!raw) {
            return { failedAttempts: 0, lockedUntil: null };
        }

        const parsed = JSON.parse(raw) as Partial<PinLockState>;
        return {
            failedAttempts:
                typeof parsed.failedAttempts === 'number' ? parsed.failedAttempts : 0,
            lockedUntil:
                typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
        };
    } catch {
        return { failedAttempts: 0, lockedUntil: null };
    }
};

export const writePinLockState = async (state: PinLockState) => {
    await AsyncStorage.setItem(PIN_LOCK_STORAGE_KEY, JSON.stringify(state));
};

export const clearPinLockState = async () => {
    await AsyncStorage.removeItem(PIN_LOCK_STORAGE_KEY);
};

export const formatLockCountdown = (remainingMs: number) => {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
