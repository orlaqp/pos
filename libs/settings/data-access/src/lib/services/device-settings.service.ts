import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_SETTINGS_KEY = 'device-settings-v1';

export type DeviceSettings = {
    payFromSalesScreen: boolean;
};

const DEFAULT_DEVICE_SETTINGS: DeviceSettings = {
    payFromSalesScreen: false,
};

const sanitizeDeviceSettings = (
    value: Partial<DeviceSettings> | null | undefined
): DeviceSettings => ({
    ...DEFAULT_DEVICE_SETTINGS,
    ...(value || {}),
    payFromSalesScreen: value?.payFromSalesScreen === true,
});

export class DeviceSettingsService {
    static async getSettings(): Promise<DeviceSettings> {
        try {
            const raw = await AsyncStorage.getItem(DEVICE_SETTINGS_KEY);
            if (!raw) {
                return DEFAULT_DEVICE_SETTINGS;
            }

            return sanitizeDeviceSettings(JSON.parse(raw) as Partial<DeviceSettings>);
        } catch (error) {
            console.error('Unable to read device settings', error);
            return DEFAULT_DEVICE_SETTINGS;
        }
    }

    static async saveSettings(nextSettings: Partial<DeviceSettings>) {
        const current = await DeviceSettingsService.getSettings();
        const merged = sanitizeDeviceSettings({
            ...current,
            ...nextSettings,
        });

        await AsyncStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(merged));
        return merged;
    }
}
