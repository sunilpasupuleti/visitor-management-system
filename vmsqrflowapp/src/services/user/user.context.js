/* eslint-disable quotes */
import React, {useContext} from 'react';
import {createContext, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import auth, {firebase} from '@react-native-firebase/auth';
import {BACKEND_URL} from '@env';
import useHttp from '../../hooks/use-http';
import {AuthenticationContext} from '../authentication/authentication.context';
import {Alert} from 'react-native';

export const UserContext = createContext({
  onGetAllMeetings: () => null,
  onUpdateMeetingStatus: (data = {}, successCb, errorCb) => null,
  meetings: [],
});

export const UserContextProvider = ({children}) => {
  const [meetings, setMeetings] = useState(false);
  const {userData} = useContext(AuthenticationContext);
  const {sendRequest} = useHttp();
  const dispatch = useDispatch();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (userData) {
      onGetAllMeetings(
        result => {
          if (result && result.meetings) {
            setMeetings(result.meetings);
          }
        },
        () => {
          Alert.alert('Error occured');
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const onGetAllMeetings = async (
    successCb = () => null,
    errorCb = () => null,
  ) => {
    let jwtToken = await firebase.auth().currentUser.getIdToken();
    let url = BACKEND_URL + '/meeting/getAllMeetings';
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
      true,
      false,
    );
  };

  const onUpdateMeetingStatus = async (
    data,
    successCb = () => null,
    errorCb = () => null,
  ) => {
    let jwtToken = await firebase.auth().currentUser.getIdToken();
    let url = BACKEND_URL + '/meeting/updateMeetingStatusQrFlow';
    sendRequest(
      {
        type: 'POST',
        url: url,
        data: data,
        headers: {
          Authorization: `Bearer ` + jwtToken,
        },
      },
      {
        successCallback: successCb,
        errorCallback: errorCb,
      },
      true,
      true,
    );
  };

  return (
    <UserContext.Provider
      value={{
        onGetAllMeetings,
        onUpdateMeetingStatus,
        meetings,
      }}>
      {children}
    </UserContext.Provider>
  );
};
