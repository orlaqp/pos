import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './app/App';
import NetInfo from "@react-native-community/netinfo";

import { Auth, Amplify, Storage } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

AppRegistry.registerComponent('main', () => App);
