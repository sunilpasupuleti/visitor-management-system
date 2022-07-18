import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import store from './src/store';
import messaging from '@react-native-firebase/messaging';
import {onMessageReceived} from './src/components/fcm/FCMService';
import AppFake from './AppFake';
import {Provider} from 'react-redux';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('HEADLESS BACKGROUND: ' + JSON.stringify(remoteMessage));
  onMessageReceived(remoteMessage);
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    return <AppFake />;
  }

  return <Redux />;
}

const Redux = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => HeadlessCheck);
