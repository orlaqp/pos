import AsyncStorage from '@react-native-async-storage/async-storage';
import { markAppInstallSeen } from './install-state';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

describe('markAppInstallSeen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns true and stores a marker on first launch', async () => {
        jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);

        await expect(markAppInstallSeen()).resolves.toBe(true);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            'app-install-marker-v1',
            '1'
        );
    });

    it('returns false when the install marker already exists', async () => {
        jest.mocked(AsyncStorage.getItem).mockResolvedValue('1');

        await expect(markAppInstallSeen()).resolves.toBe(false);
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('fails closed when storage access throws', async () => {
        jest.mocked(AsyncStorage.getItem).mockRejectedValue(
            new Error('storage unavailable')
        );

        await expect(markAppInstallSeen()).resolves.toBe(false);
    });
});
