import React from 'react';

import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {Dimensions} from 'react-native';
import {Notification} from '../../components/utility/Notification';
import {SettingsNavigator} from './settings.navigator';
import {HomeScreen} from '../../features/home/screens/home.screen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          options={{
            headerMode: 'screen',
            gestureResponseDistance: Dimensions.get('window').height - 200,
            ...TransitionPresets.ModalPresentationIOS,
          }}
          name="Settings"
          component={SettingsNavigator}
        />
      </Stack.Navigator>
      <Notification />
    </>
  );
};
