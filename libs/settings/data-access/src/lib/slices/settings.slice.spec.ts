import {
  fetchGlobalSettings,
  initialSettingsState,
  resetDataStore,
  settingsActions,
  settingsReducer,
} from './settings.slice';

describe('settings reducer', () => {
  it('returns initial state', () => {
    expect(settingsReducer(undefined, { type: '' })).toEqual(initialSettingsState);
  });

  it('handles local actions', () => {
    let state = settingsReducer(undefined, settingsActions.set(true));
    expect(state.darkTheme).toBe(true);

    state = settingsReducer(state, settingsActions.setLanguage('es'));
    expect(state.languageTag).toBe('es');

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
  });
});
