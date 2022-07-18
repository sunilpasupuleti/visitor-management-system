/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useContext, useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {FlexRow, MainWrapper, ToggleSwitch} from '../../../components/styles';
import {SafeArea} from '../../../components/utility/safe-area.component';
import {
  ProfileText,
  QrCode,
  QrCodeWrapper,
  Setting,
  SettingIconWrapper,
  SettingsCard,
  SettingTitle,
} from '../components/settings.styles';
import {AuthenticationContext} from '../../../services/authentication/authentication.context';
import {Spacer} from '../../../components/spacer/spacer.component';
import {useTheme} from 'styled-components/native';
import {SettingsCardContent} from '../components/settings.styles';
import {Alert, PermissionsAndroid, ScrollView} from 'react-native';
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';
import {useDispatch} from 'react-redux';
import {notificationActions} from '../../../store/notification-slice';
export const SettingsScreen = ({navigation}) => {
  const {onLogout, userData} = useContext(AuthenticationContext);

  const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    AsyncStorage.getItem(`@vms-app-lock`).then(result => {
      let parsedResult = JSON.parse(result);
      if (parsedResult) {
        setIsAppLockEnabled(true);
      } else {
        setIsAppLockEnabled(false);
      }
    });

    navigation.setOptions({
      headerTitle: 'Settings',
      headerRight: () => (
        <Ionicons
          onPress={() => navigation.goBack()}
          style={{marginRight: 10}}
          name="close-circle-outline"
          size={30}
          color={theme.colors.brand.primary}
        />
      ),
      headerLeft: () => null,
    });
  }, []);

  const onSetScreenLock = async () => {
    TouchID.authenticate('Authenticate to enable / disable app lock.', {})
      .then(async success => {
        // Success code
        await AsyncStorage.setItem(
          `@vms-app-lock`,
          JSON.stringify(!isAppLockEnabled),
        ).then(() => {
          setIsAppLockEnabled(!isAppLockEnabled);
        });
      })
      .catch(error => {
        Alert.alert('Error! Cancelled/ Device do not support/ Internal Error');
        console.log(error, 'error in biometric settings screen');
        // Failure code
      });
  };

  const onDownloadQrCode = async () => {
    let qr = userData.company.qrCode;
    if (qr) {
      if (Platform.OS === 'ios') {
        // write code
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message: 'App needs access to your storage to download Photos',
            },
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('storage permission granted successfully');
            downloadQr(qr);
          } else {
            Alert.alert('Storage Permission not granted');
          }
        } catch (err) {
          console.warn(err, 'error occured storage');
        }
      }
    } else {
      Alert.alert('Error while download');
    }
  };

  const downloadQr = qr => {
    if (qr) {
      var Base64Code = qr.split(/,\s*/);
      let prefix = Base64Code[0]; //data:image/png;base64,
      let format = prefix.match(/image\/(jpeg|png|jpg)/); //at 0 index image/jpeg at 1 index it shows png or jpeg
      const dirs = RNFetchBlob.fs.dirs;
      var path = dirs.DownloadDir + '/qr-code.' + format[1];
      RNFetchBlob.fs
        .writeFile(path, Base64Code[1], 'base64')
        .then(res => {
          console.log('file qr download : ', res);
          dispatch(
            notificationActions.showToast({
              status: 'success',
              message:
                'QR CODE downloaded! Please check your Downloads folder.',
            }),
          );
        })
        .catch(err => {
          console.log(err, 'err in download qr');
          dispatch(
            notificationActions.showToast({
              status: 'error',
              message: 'Error occured while downloading the QR CODE',
            }),
          );
        });
    } else {
      Alert.alert('Error while download');
    }
  };
  return (
    <SafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MainWrapper>
          <Spacer size={'medium'} />
          {/* display profile and email */}
          <QrCodeWrapper>
            {userData && userData.company && userData.company.qrCode && (
              <QrCode
                source={{
                  uri: userData.company.qrCode,
                }}
              />
            )}
            {userData && userData.email && (
              <ProfileText fontfamily="heading">{userData?.email}</ProfileText>
            )}
            {userData && !userData.email && userData.displayName && (
              <ProfileText fontfamily="heading">
                {userData.displayName}
              </ProfileText>
            )}
          </QrCodeWrapper>

          <Spacer size={'xlarge'}>
            <SettingsCard>
              {/* Appearance card */}
              <SettingsCardContent onPress={onDownloadQrCode}>
                <Setting justifyContent="space-between">
                  <FlexRow>
                    <SettingIconWrapper color="rgba(51, 184, 151, 0.7)">
                      <Ionicons name="ios-download" size={20} color="#fefefe" />
                    </SettingIconWrapper>

                    <SettingTitle>Download QR CODE</SettingTitle>
                  </FlexRow>
                </Setting>
              </SettingsCardContent>
            </SettingsCard>
          </Spacer>

          <Spacer size={'xlarge'}>
            <SettingsCard>
              {/* Appearance card */}
              <SettingsCardContent
                onPress={() => navigation.navigate('Appearance')}>
                <Setting justifyContent="space-between">
                  <FlexRow>
                    <SettingIconWrapper color="rgba(84,91,206,0.9)">
                      <Ionicons name="ios-moon" size={20} color="#fefefe" />
                    </SettingIconWrapper>

                    <SettingTitle>Appearance</SettingTitle>
                  </FlexRow>
                </Setting>
              </SettingsCardContent>
            </SettingsCard>
          </Spacer>

          {/* another card for logout and applock */}
          <Spacer size={'xlarge'}>
            <SettingsCard>
              <SettingsCardContent>
                <Setting justifyContent="space-between">
                  <FlexRow>
                    <SettingIconWrapper color="#167ef5">
                      <Ionicons
                        name="md-finger-print-outline"
                        size={20}
                        color="#fff"
                      />
                    </SettingIconWrapper>

                    <SettingTitle>Enable app lock</SettingTitle>
                  </FlexRow>

                  <ToggleSwitch
                    value={isAppLockEnabled}
                    onValueChange={() => onSetScreenLock()}
                  />
                </Setting>
              </SettingsCardContent>

              <SettingsCardContent onPress={onLogout} padding={'15px'}>
                <Setting justifyContent="space-between">
                  <FlexRow>
                    <SettingIconWrapper color="#8c8f90">
                      <Ionicons name="log-out-outline" size={20} color="#fff" />
                    </SettingIconWrapper>

                    <SettingTitle>Sign Out</SettingTitle>
                  </FlexRow>
                </Setting>
              </SettingsCardContent>
            </SettingsCard>
          </Spacer>
        </MainWrapper>
      </ScrollView>
    </SafeArea>
  );
};
