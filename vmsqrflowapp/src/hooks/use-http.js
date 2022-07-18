import axios from 'axios';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {loaderActions} from '../store/loader-slice';
import {notificationActions} from '../store/notification-slice';
axios.defaults.withCredentials = true;

const useHttp = () => {
  const dispatch = useDispatch();
  const sendRequest = useCallback(
    async (
      requestConfig,
      callbacks = {
        successCallback: () => null,
        errorCallback: () => null,
      },
      loader = true,
      notify = true,
    ) => {
      loader && dispatch(loaderActions.showLoader({backdrop: true}));
      let type = requestConfig.type;
      let url = requestConfig.url;
      let data = requestConfig.data;
      let headers = requestConfig.headers;

      try {
        let request;
        if (!type || type === 'GET') {
          request = axios.get(url, {headers: headers});
        } else if (type && type === 'POST') {
          request = axios.post(url, data, {
            headers: headers,
            withCredentials: true,
          });
        } else if (type && type === 'PUT') {
          request = axios.put(url, data, {headers: headers});
        } else if (type && type === 'DELETE') {
          request = axios.delete(url, data, {headers: headers});
        } else {
          loader && dispatch(loaderActions.hideLoader());
          dispatch(
            notificationActions.showToast({
              status: 'error',
              message: 'Invalid http call request',
            }),
          );

          return;
        }
        request
          .then(res => {
            callbacks.successCallback(res.data);
            if (res.data && res.data.message) {
              notify &&
                dispatch(
                  notificationActions.showToast({
                    status: 'success',

                    message: res.data.message,
                  }),
                );
            }
            loader && dispatch(loaderActions.hideLoader());
          })
          .catch(async err => {
            callbacks.errorCallback &&
              callbacks.errorCallback(err.response?.data);
            console.log(err, 'error in http call');
            loader && dispatch(loaderActions.hideLoader());
            let message;
            if (
              err.response &&
              err.response.data &&
              err.response.data.message
            ) {
              message = err.response.data.message;
            } else if (err.response && err.response.statusText) {
              message = err.response.statusText;
            } else {
              message = 'Error in http call request';
            }

            dispatch(
              notificationActions.showToast({
                status: 'error',

                message: message,
              }),
            );
          });
      } catch (err) {
        callbacks.errorCallback && callbacks.errorCallback();
        loader && dispatch(loaderActions.showLoader({backdrop: true}));
        dispatch(
          notificationActions.showToast({
            status: 'error',
            message: err,
          }),
        );
      }
    },
    [dispatch],
  );

  return {
    sendRequest,
  };
};

export default useHttp;
