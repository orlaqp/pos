import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './app/App';

import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { initializeDataStore } from '@pos/shared/data-store';
import { store } from '@pos/store';
import '@pos/settings/data-access';

import awsConfig from './aws-exports';
import {
    awsConfigActions,
    settingsActions,
    languageTag,
    AvailableLanguage,
} from '@pos/settings/data-access';
import { logStartupDiagnostics } from './app/startup-diagnostics';
store.dispatch(awsConfigActions.set(awsConfig));

// Amplify.Logger.LOG_LEVEL = 'DEBUG';
Amplify.configure(awsconfig);
initializeDataStore(store.dispatch);
logStartupDiagnostics(awsConfig as unknown as Record<string, unknown>);

// i18n
store.dispatch(settingsActions.setLanguage(languageTag as AvailableLanguage));

AppRegistry.registerComponent('main', () => App);
