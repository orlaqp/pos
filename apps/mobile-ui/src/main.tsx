import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { AppRegistry, LogBox } from 'react-native';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { defaultStorage } from 'aws-amplify/utils';
import awsconfig from './aws-exports';
import amplifyConfig from './amplifyconfiguration.json';
import { logStartupDiagnostics } from './app/startup-diagnostics';

// Amplify.Logger.LOG_LEVEL = 'DEBUG';
LogBox.ignoreLogs([
    '[ERROR] DataStore - Sync processor retry error',
    'DataStore - Sync processor retry error',
]);
cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);
Amplify.configure(amplifyConfig);
const { store } = require('@pos/store');
const {
    awsConfigActions,
    settingsActions,
    languageTag,
} = require('@pos/settings/data-access');

store.dispatch(awsConfigActions.set(awsconfig));
require('@pos/shared/data-store').initializeDataStore(store.dispatch);
logStartupDiagnostics(amplifyConfig as unknown as Record<string, unknown>);

// i18n
store.dispatch(settingsActions.setLanguage(languageTag));

AppRegistry.registerComponent('main', () => require('./app/App').default);
