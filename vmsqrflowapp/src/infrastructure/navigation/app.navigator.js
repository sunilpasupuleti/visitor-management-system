import React from 'react';

import {
  CardStyleInterpolators,
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import {Dimensions} from 'react-native';
import {Notification} from '../../components/utility/Notification';
import {SettingsNavigator} from './settings.navigator';
import {HomeScreen} from '../../features/home/screens/home.screen';
import {useTheme} from 'styled-components/native';
import {MeetingScreen} from '../../features/meeting/screens/meeting.screen';
import {UserContextProvider} from '../../services/user/user.context';
import {SocketContextProvider} from '../../services/socket/socket.context';
import {DashboardScreen} from '../../features/dashboard/screens/dashboard.screen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const theme = useTheme();
  const headerStyles = {
    headerStyle: {
      backgroundColor: theme.colors.ui.body,
    },
    headerTintColor: theme.colors.headerTintColor,
    headerTitleAlign: 'center',
    headerShadowVisible: false,
  };

  return (
    <SocketContextProvider>
      <UserContextProvider>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Home" component={HomeScreen} />

          <Stack.Screen
            options={{
              headerShown: true,
              headerMode: 'screen',
              ...headerStyles,
              cardStyleInterpolator:
                CardStyleInterpolators.forBottomSheetAndroid,
            }}
            name="Meeting"
            component={MeetingScreen}
          />

          <Stack.Screen
            options={{
              headerMode: 'screen',
              gestureResponseDistance: Dimensions.get('window').height - 200,
              ...TransitionPresets.ModalPresentationIOS,
            }}
            name="Settings"
            component={SettingsNavigator}
          />

          <Stack.Screen
            options={{
              headerMode: 'screen',
              headerShown: true,
              ...headerStyles,
              gestureResponseDistance: Dimensions.get('window').height - 200,
              ...TransitionPresets.ModalPresentationIOS,
            }}
            name="Dashboard"
            component={DashboardScreen}
          />
        </Stack.Navigator>

        <Notification />
      </UserContextProvider>
    </SocketContextProvider>
  );
};
