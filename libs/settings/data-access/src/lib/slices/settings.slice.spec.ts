import {
  fetchDeviceSettings,
  fetchGlobalSettings,
  initialSettingsState,
  resetDataStore,
  settingsActions,
  settingsReducer,
} from './settings.slice';
import { GlobalSettingsEntityMapper } from '../global-settings.dto';

describe('settings reducer', () => {
  it('returns initial state', () => {
    expect(settingsReducer(undefined, { type: '' })).toEqual(initialSettingsState);
  });

  it('handles local actions', () => {
    let state = settingsReducer(undefined, settingsActions.set(true));
    expect(state.darkTheme).toBe(true);

    state = settingsReducer(state, settingsActions.setLanguage('es'));
    expect(state.languageTag).toBe('es');

    state = settingsReducer(state, settingsActions.setPayFromSalesScreen(true));
    expect(state.payFromSalesScreen).toBe(true);

    state = settingsReducer(state, settingsActions.setGlobalSettings({ taxValue: 7 } as any));
    expect(state.globalSettings).toEqual(expect.objectContaining({ taxValue: 7 }));
  });

  it('handles resetDataStore lifecycle', () => {
    let state = settingsReducer(undefined, resetDataStore.pending('', undefined));
    expect(state.dataStoreStatus).toBe('resetting');

    state = settingsReducer(state, resetDataStore.fulfilled(undefined, '', undefined));
    expect(state.dataStoreStatus).toBe('synced');

    state = settingsReducer(
      state,
      resetDataStore.rejected(new Error('fail'), '', undefined)
    );
    expect(state.dataStoreStatus).toBe('error');
  });

  it('handles fetchGlobalSettings.fulfilled', () => {
    const payload = { ebtEnabled: true } as any;
    const state = settingsReducer(
      undefined,
      fetchGlobalSettings.fulfilled(payload, '', undefined)
    );
    expect(state.globalSettings).toEqual(payload);
    expect(state.globalSettingsStatus).toBe('loaded');
  });

  it('maps missing global tax settings to zero', () => {
    expect(
      GlobalSettingsEntityMapper.from({
        id: 'settings-1',
        enforceSalesBasedOnInventory: false,
        timezone: 'America/New_York',
        taxValue: undefined,
      } as any)
    ).toEqual(expect.objectContaining({ taxValue: 0 }));
  });

  it('maps persisted global tax settings', () => {
    expect(
      GlobalSettingsEntityMapper.from({
        id: 'settings-1',
        enforceSalesBasedOnInventory: false,
        timezone: 'America/New_York',
        taxValue: 8.25,
      } as any)
    ).toEqual(expect.objectContaining({ taxValue: 8.25 }));
  });

  it('handles fetchGlobalSettings pending/rejected', () => {
    let state = settingsReducer(undefined, fetchGlobalSettings.pending('', undefined));
    expect(state.globalSettingsStatus).toBe('loading');

    state = settingsReducer(
      state,
      fetchGlobalSettings.rejected(new Error('fail'), '', undefined)
    );
    expect(state.globalSettingsStatus).toBe('error');
  });

  it('handles fetchDeviceSettings lifecycle', () => {
    let state = settingsReducer(undefined, fetchDeviceSettings.pending('', undefined));
    expect(state.deviceSettingsStatus).toBe('loading');

    state = settingsReducer(
      state,
      fetchDeviceSettings.fulfilled({ payFromSalesScreen: true }, '', undefined)
    );
    expect(state.deviceSettingsStatus).toBe('loaded');
    expect(state.payFromSalesScreen).toBe(true);

    state = settingsReducer(
      state,
      fetchDeviceSettings.rejected(new Error('fail'), '', undefined)
    );
    expect(state.deviceSettingsStatus).toBe('error');
  });

  it('maps scale barcode price format from global settings', () => {
    expect(
      GlobalSettingsEntityMapper.from({
        id: 'settings-1',
        enforceSalesBasedOnInventory: false,
        taxValue: 0,
        creditCardSurchargePercent: 0,
        timezone: 'America/New_York',
        scaleBarcodePriceFormat: 'EAN13_02_4_PLU_5_PRICE',
      } as any)
    ).toEqual(
      expect.objectContaining({
        scaleBarcodePriceFormat: 'EAN13_02_4_PLU_5_PRICE',
      })
    );
  });

  it('defaults missing scale barcode price format to legacy', () => {
    expect(
      GlobalSettingsEntityMapper.from({
        id: 'settings-1',
        enforceSalesBasedOnInventory: false,
        taxValue: 0,
        creditCardSurchargePercent: 0,
        timezone: 'America/New_York',
      } as any)
    ).toEqual(
      expect.objectContaining({
        scaleBarcodePriceFormat: 'LEGACY_4_DIGIT_PRICE',
      })
    );
  });
});
