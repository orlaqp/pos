import { AppRegistry } from 'react-native';
import App from './app/App';

import { Auth, Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

AppRegistry.registerComponent('main', () => App);
