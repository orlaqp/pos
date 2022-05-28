import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './app/App';

import { Auth, Amplify, Storage, DataStore, Hub } from 'aws-amplify';
import awsconfig from './aws-exports';
import { initializeDataStore } from '@pos/shared/data-store';
import { store } from '@pos/store';

Amplify.configure(awsconfig);
initializeDataStore(store.dispatch);

AppRegistry.registerComponent('main', () => App);
