const mockDataStoreQuery = jest.fn();
const mockDataStoreSave = jest.fn();
const mockStampTenant = jest.fn((value) => value);

class MockGlobalSettings {
  constructor(init?: Record<string, unknown>) {
    Object.assign(this, init);
  }

  static copyOf(
    source: Record<string, unknown>,
    mutator: (draft: Record<string, unknown>) => void
  ) {
    const draft = { ...source };
    mutator(draft);
    return draft;
  }
}

jest.mock('@pos/shared/amplify', () => ({
  DataStore: {
    query: (...args: unknown[]) => mockDataStoreQuery(...args),
    save: (...args: unknown[]) => mockDataStoreSave(...args),
  },
}));

jest.mock('@pos/shared/models', () => ({
  GlobalSettings: MockGlobalSettings,
}));

jest.mock('@pos/auth/data-access', () => ({
  stampTenant: (...args: unknown[]) => mockStampTenant(...args),
}));

import {
  fetchDeviceSettings,
  fetchGlobalSettings,
  initialSettingsState,
  resetDataStore,
  settingsActions,
  settingsReducer,
} from './settings.slice';
import { GlobalSettingsEntityMapper } from '../global-settings.dto';
import { GlobalSettingsService } from '../services/global-settings.service';
import { schema as sharedSchema } from '../../../../../shared/models/src/models/schema';

describe('settings reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    state = settingsReducer(
      state,
      settingsActions.setGlobalSettings({
        taxValue: 7,
        creditCardSurchargePercent: 3.5,
      } as any)
    );
    expect(state.globalSettings).toEqual(
      expect.objectContaining({ taxValue: 7, creditCardSurchargePercent: 3.5 })
    );
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
    const payload = { ebtEnabled: true, creditCardSurchargePercent: 2 } as any;
    const state = settingsReducer(
      undefined,
      fetchGlobalSettings.fulfilled(payload, '', undefined)
    );
    expect(state.globalSettings).toEqual(payload);
    expect(state.globalSettingsStatus).toBe('loaded');
  });

  it('includes creditCardSurchargePercent in the shared GlobalSettings schema', () => {
    expect(
      sharedSchema.models.GlobalSettings.fields.creditCardSurchargePercent
    ).toEqual(
      expect.objectContaining({
        name: 'creditCardSurchargePercent',
        type: 'Float',
        isRequired: false,
      })
    );
  });

  it('maps missing global tax settings to zero', () => {
    expect(
      GlobalSettingsEntityMapper.from({
        id: 'settings-1',
        enforceSalesBasedOnInventory: false,
        timezone: 'America/New_York',
        taxValue: undefined,
        creditCardSurchargePercent: undefined,
      } as any)
    ).toEqual(
      expect.objectContaining({ taxValue: 0, creditCardSurchargePercent: 0 })
    );
  });

  it('maps persisted global tax settings', () => {
    expect(
      GlobalSettingsEntityMapper.from({
        id: 'settings-1',
        enforceSalesBasedOnInventory: false,
        timezone: 'America/New_York',
        taxValue: 8.25,
        creditCardSurchargePercent: 3.5,
      } as any)
    ).toEqual(
      expect.objectContaining({
        taxValue: 8.25,
        creditCardSurchargePercent: 3.5,
      })
    );
  });

  it('saves surcharge updates onto existing global settings', async () => {
    mockDataStoreQuery.mockResolvedValueOnce([
      {
        id: 'settings-1',
        enforceSalesBasedOnInventory: false,
        taxValue: 8.25,
        creditCardSurchargePercent: 1,
        timezone: 'America/New_York',
      },
    ]);
    mockDataStoreSave.mockResolvedValueOnce(undefined);

    await GlobalSettingsService.updateSettings({
      id: 'settings-1',
      enforceSalesBasedOnInventory: true,
      taxValue: 8.25,
      creditCardSurchargePercent: 3.5,
      timezone: 'America/Chicago',
    });

    expect(mockDataStoreSave).toHaveBeenCalledWith(
      expect.objectContaining({
        enforceSalesBasedOnInventory: true,
        taxValue: 8.25,
        creditCardSurchargePercent: 3.5,
        timezone: 'America/Chicago',
      })
    );
  });

  it('defaults invalid surcharge values to zero when creating global settings', async () => {
    mockDataStoreQuery.mockResolvedValueOnce([]);
    mockDataStoreSave.mockResolvedValueOnce(undefined);

    await GlobalSettingsService.updateSettings({
      id: 'settings-1',
      enforceSalesBasedOnInventory: false,
      taxValue: 8.25,
      creditCardSurchargePercent: Number.NaN,
      timezone: 'America/New_York',
    });

    expect(mockStampTenant).toHaveBeenCalledWith(
      expect.objectContaining({
        enforceSalesBasedOnInventory: false,
        taxValue: 8.25,
        creditCardSurchargePercent: 0,
        timezone: 'America/New_York',
      })
    );
    expect(mockDataStoreSave).toHaveBeenCalledWith(
      expect.objectContaining({
        enforceSalesBasedOnInventory: false,
        taxValue: 8.25,
        creditCardSurchargePercent: 0,
        timezone: 'America/New_York',
      })
    );
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
});
