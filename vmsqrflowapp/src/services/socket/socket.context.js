import React, {createContext} from 'react';
import {BACKEND_URL} from '@env';
import {io} from 'socket.io-client';

export const SocketContext = createContext({
  socket: null,
  onEmitEvent: () => {},
  onFetchEvent: () => {},
});

export const SocketContextProvider = ({children}) => {
  // var socket;
  const socket = io(BACKEND_URL);

  const onEmitEvent = (eventName, data = {}) => {
    socket.emit(eventName, data);
  };

  const onFetchEvent = (eventName, callback = () => {}) => {
    socket.on(eventName, callback);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onEmitEvent,
        onFetchEvent,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
