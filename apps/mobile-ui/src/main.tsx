import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './app/App';

import { Auth, Amplify, Storage, DataStore, Hub } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

AppRegistry.registerComponent('main', () => App);


// Create listener
const listener = Hub.listen('datastore', async hubData => {
    const  { event, data } = hubData.payload;
    console.log(`${event} - data: ${JSON.stringify(data)}`);

    if (event === 'networkStatus') {
      console.log(`User has a network connection: ${data.active}`)
    }
  })
  
