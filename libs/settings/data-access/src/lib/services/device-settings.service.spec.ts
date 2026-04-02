import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DeviceSettingsService,
} from './device-settings.service';

describe('DeviceSettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns defaults when storage is empty', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);

    await expect(DeviceSettingsService.getSettings()).resolves.toEqual({
      payFromSalesScreen: false,
    });
  });

  it('persists pay from sales updates', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(
      JSON.stringify({ payFromSalesScreen: false })
    );

    await expect(
      DeviceSettingsService.saveSettings({ payFromSalesScreen: true })
    ).resolves.toEqual({
      payFromSalesScreen: true,
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'device-settings-v1',
      JSON.stringify({ payFromSalesScreen: true })
    );
  });
});
