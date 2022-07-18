/* eslint-disable quotes */
import React from 'react';
import {createContext, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import TouchID from 'react-native-touch-id';
import auth, {firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {notificationActions} from '../../store/notification-slice';
import messaging from '@react-native-firebase/messaging';
import {loaderActions} from '../../store/loader-slice';
import {BACKEND_URL} from '@env';
import useHttp from '../../hooks/use-http';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  imageColor: '#5756d5', // Android
  imageErrorColor: '#5756d5', // Android
  sensorDescription: 'Touch sensor', // Android
  sensorErrorDescription: 'Failed', // Android
  cancelText: 'Cancel', // Android
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
};

export const AuthenticationContext = createContext({
  isLocalAuthenticated: false,
  onLocalAuthenticate: () => null,
  onSignInWithEmail: (
    email,
    password,
    successCallback = () => null,
    errorCallback = () => null,
  ) => null,
  onSetUserData: () => null,
  isAuthenticated: false,
  userData: null,
  onLogout: () => null,
  onUpdateUserDetails: () => null,
});

export const AuthenticationContextProvider = ({children}) => {
  const [isLocalAuthenticated, setIsLocalAuthenticated] = useState('pending');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [userData, setUserData] = useState(null);
  const {sendRequest} = useHttp();
  const dispatch = useDispatch();

  useEffect(() => {
    AsyncStorage.getItem(`@vms-app-lock`).then(result => {
      let parsedResult = JSON.parse(result);
      if (parsedResult) {
        setAppLockEnabled(true);
      } else {
        setAppLockEnabled(false);
      }
    });

    const unsubcribe = auth().onAuthStateChanged(async user => {
      if (user) {
        onGetUserDetails(
          user.uid,
          details => {
            if (details && details.allowed) {
              setIsAuthenticated(true);
              setUserData(details.data);
              if (appLockEnabled) {
                onLocalAuthenticate();
              } else {
                setIsLocalAuthenticated('success');
              }
            } else {
              setIsAuthenticated(false);
              // firebase.auth().signOut();
            }
          },
          err => {
            console.log(err);
            // firebase.auth().signOut();
            // onLogout()
            setIsAuthenticated(false);
            if (err.message) {
              Alert.alert(err.message);
            }
          },
        );
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => {
      unsubcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLocalAuthenticate = () => {
    TouchID.authenticate(
      'Authenticate to continue to the app.',
      optionalConfigObject,
    )
      .then(success => {
        // Success code
        setIsLocalAuthenticated('success');
      })
      .catch(error => {
        setIsLocalAuthenticated('failed');
        console.log(error, 'error in biometric');
        // Failure code
      });
  };

  const onSignInWithEmail = async (
    email,
    password,
    successCallback = () => null,
    errorCallback = () => null,
  ) => {
    try {
      await auth()
        .signInWithEmailAndPassword(email, password)
        .then(snapshot => {
          successCallback();
        });
    } catch (e) {
      console.log(e, 'error with sign in with email and password');
      let error = '';
      switch (e.code) {
        case 'auth/invalid-email':
          error = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          error = 'The requested user was disabled by admin!';
          break;
        case 'auth/user-not-found':
          error = 'No user found with the provided details!';
          break;
        case 'auth/wrong-password':
          error = 'Password is incorrect';
          break;
      }
      errorCallback({message: error});
    }
  };

  const onSetUserData = async data => {
    let token = null;
    await messaging()
      .getToken()
      .then(t => {
        token = t;
      })
      .catch(err => {
        console.log(err);
      });
    let user = data.user;
    let transformedData = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      providerId: user.providerId,
      uid: user.uid,
      fcmToken: token,
      active: true,
    };
    onStoreUserDataToFirebase(transformedData)
      .then(async () => {
        dispatch(loaderActions.hideLoader());
      })
      .catch(err => {
        dispatch(loaderActions.hideLoader());
        console.log(err, ' error while storing user details to backend.');
      });
  };

  const onStoreUserDataToFirebase = async userData => {
    // return firestore()
    //   .collection(userData.uid)
    //   .doc('user-data')
    //   .set(userData, {merge: true});
  };

  const onLogout = async () => {
    auth()
      .signOut()
      .then(() => {
        setIsAuthenticated(false);
        setIsLocalAuthenticated('pending');
        setUserData(null);
      });
  };

  const onUpdateUserDetails = async details => {
    let token = null;
    await messaging()
      .getToken()
      .then(t => {
        token = t;
      })
      .catch(err => {});
    dispatch(loaderActions.showLoader({backdrop: true}));
    firestore()
      .collection(userData.uid)
      .doc('user-data')
      .update({
        ...details,
        fcmToken: token,
      })
      .then(() => {
        onGetUserDetails(userData.uid)
          .then(() => {
            dispatch(loaderActions.hideLoader());
            dispatch(
              notificationActions.showToast({
                status: 'success',
                message: 'Updated successfully',
              }),
            );
          })
          .catch(err => {
            dispatch(loaderActions.hideLoader());
          });
      })
      .catch(err => {
        dispatch(loaderActions.hideLoader());
        dispatch(
          notificationActions.showToast({
            status: 'error',
            message: 'Error in updating the details!',
          }),
        );
        console.log(err, 'Error while updating the user details');
      });
  };

  const onGetUserDetails = async (
    uid,
    successCb = () => null,
    errorCb = () => null,
  ) => {
    let jwtToken = await firebase.auth().currentUser.getIdToken();
    let url = BACKEND_URL + '/admin/getAdmin?uid=' + uid;

    sendRequest(
      {
        type: 'GET',
        url: url,
        headers: {
          Authorization: `Bearer ` + jwtToken,
        },
      },
      {
        successCallback: successCb,
        errorCallback: errorCb,
      },
    );
  };

  return (
    <AuthenticationContext.Provider
      value={{
        isLocalAuthenticated,
        onLocalAuthenticate,
        isAuthenticated,
        userData,
        onLogout,
        onSignInWithEmail,
        onSetUserData,
        onUpdateUserDetails,
      }}>
      {children}
    </AuthenticationContext.Provider>
  );
};
