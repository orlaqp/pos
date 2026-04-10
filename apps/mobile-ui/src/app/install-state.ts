import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALL_MARKER_KEY = 'app-install-marker-v1';

export const markAppInstallSeen = async () => {
    try {
        const existingMarker = await AsyncStorage.getItem(INSTALL_MARKER_KEY);
        if (existingMarker === '1') {
            return false;
        }

        await AsyncStorage.setItem(INSTALL_MARKER_KEY, '1');
        return true;
    } catch {
        return false;
    }
};
