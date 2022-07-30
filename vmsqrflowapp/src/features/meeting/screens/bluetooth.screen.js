/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Created by januslo on 2018/12/27.
 */

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  Button,
  ScrollView,
  DeviceEventEmitter,
  Switch,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
  Alert,
} from 'react-native';
import {
  BluetoothEscposPrinter,
  BluetoothManager,
} from 'react-native-bluetooth-escpos-printer';
import {Spacer} from '../../../components/spacer/spacer.component';
import {FlexRow, MainWrapper} from '../../../components/styles';
import {Text} from '../../../components/typography/text.component';
import {SafeArea} from '../../../components/utility/safe-area.component';

var {height, width} = Dimensions.get('window');

export const BluetoothScreen = () => {
  const [devices, setDevices] = useState(null);
  const [pairedDs, setPairedDs] = useState([]);
  const [foundDs, setFoundDs] = useState([]);
  const [bleOpend, setBleOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boundAddress, setBoundAddress] = useState('');
  const [debugMsg, setDebugMsg] = useState('');
  const [name, setName] = useState('');

  const listeners = [];

  function deviceAlreadPaired(rsp) {
    var ds = null;
    if (typeof rsp.devices === 'object') {
      ds = rsp.devices;
    } else {
      try {
        ds = JSON.parse(rsp.devices);
      } catch (e) {}
    }
    if (ds && ds.length) {
      let pared = pairedDs;
      pared = pared.concat(ds || []);
      setPairedDs(pared);
    }
  }

  function deviceFoundEvent(rsp) {
    //alert(JSON.stringify(rsp))
    var r = null;
    try {
      if (typeof rsp.device === 'object') {
        r = rsp.device;
      } else {
        r = JSON.parse(rsp.device);
      }
    } catch (e) {
      //alert(e.message);
      //ignore
    }
    //alert('f')
    if (r) {
      let found = foundDs || [];
      if (found.findIndex) {
        let duplicated = found.findIndex(function (x) {
          return x.address === r.address;
        });
        //CHECK DEPLICATED HERE...
        if (duplicated === -1) {
          found.push(r);
          setFoundDs(found);
        }
      }
    }
  }

  function renderRow(rows) {
    let items = [];
    for (let i in rows) {
      let row = rows[i];
      if (row.address) {
        items.push(
          <TouchableOpacity
            key={new Date().getTime() + i}
            style={styles.wtf}
            onPress={() => {
              BluetoothManager.connect(row.address).then(
                s => {
                  setLoading(false);
                  setBoundAddress(row.address);
                  setName(row.name || 'UNKNOWN');
                },
                e => {
                  setLoading(false);
                  console.log('Error in render row ', e.message);
                  Alert.alert(e.message);
                },
              );
            }}>
            <Text style={styles.name}>{row.name || 'UNKNOWN'}</Text>
            <Text style={styles.address}>{row.address}</Text>
          </TouchableOpacity>,
        );
      }
    }
    return items;
  }

  function scan() {
    setFoundDs([]);
    setPairedDs([]);
    setName('');
    setBoundAddress('');
    setLoading(true);
    BluetoothManager.scanDevices().then(
      s => {
        var ss = s;
        ss = JSON.parse(ss); //@FIX_it: the parse action too weired..
        var found = ss.found;
        var fds = foundDs;
        if (found && found.length > 0) {
          fds = found;
        }
        setLoading(false);
        setFoundDs(fds);
      },
      err => {
        setLoading(false);
        console.log(err, 'Eror in scan function');
        Alert.alert(err.message + ' - In scan function');
      },
    );
  }

  useEffect(() => {
    BluetoothManager.isBluetoothEnabled().then(
      enabled => {
        setBleOpened(enabled);
        setLoading(false);
      },
      err => {
        console.log(err, 'Error in is bluetooth enabled');
      },
    );

    if (Platform.OS === 'android') {
      listeners.push(
        DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
          rsp => {
            deviceAlreadPaired(rsp);
          },
        ),
      );
      listeners.push(
        DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_DEVICE_FOUND,
          rsp => {
            deviceFoundEvent(rsp);
          },
        ),
      );
      listeners.push(
        DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_CONNECTION_LOST,
          () => {
            setBoundAddress('');
            setName('');
          },
        ),
      );
      listeners.push(
        DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
          () => {
            ToastAndroid.show(
              'Device Not Support Bluetooth !',
              ToastAndroid.LONG,
            );
          },
        ),
      );
    }
  }, []);

  return (
    <SafeArea>
      <MainWrapper>
        <ScrollView style={styles.container}>
          <Text>{debugMsg}</Text>
          <Text style={styles.title}>
            Blutooth Opened: {bleOpend ? 'True' : 'False'}{' '}
          </Text>
          <View>
            <Switch
              value={bleOpend}
              onValueChange={v => {
                setLoading(true);
                if (!v) {
                  BluetoothManager.disableBluetooth().then(
                    () => {
                      setBleOpened(false);
                      setLoading(false);
                      setFoundDs([]);
                      setPairedDs([]);
                    },
                    err => {
                      console.log(err, 'error in disable bluetooth');
                      Alert.alert(err.message + ' In disabling bluetooth');
                    },
                  );
                } else {
                  BluetoothManager.enableBluetooth().then(
                    r => {
                      var paired = [];
                      if (r && r.length > 0) {
                        for (var i = 0; i < r.length; i++) {
                          try {
                            paired.push(JSON.parse(r[i]));
                          } catch (e) {
                            //ignore
                          }
                        }
                      }
                      setBleOpened(true);
                      setLoading(false);
                      setPairedDs(pairedDs);
                    },
                    err => {
                      setLoading(false);
                      console.log(err, 'error in enable bluetooth');
                      Alert.alert(err.message + ' - in enabling bluetooth');
                    },
                  );
                }
              }}
            />
            <Spacer size={'large'} />
            <Button
              disabled={loading || !bleOpend}
              onPress={() => {
                scan();
              }}
              title="Scan"
            />
          </View>
          <Spacer size={'large'} />
          <Text style={styles.title}>
            Connected :&nbsp;&nbsp;
            <Text style={styles.title} color="red">
              {!name ? 'No Devices' : name}
            </Text>
          </Text>

          <Text style={styles.title} color="green">
            Found(tap to connect):
          </Text>
          {loading ? <ActivityIndicator animating={true} /> : null}
          <View style={{flex: 1, flexDirection: 'column'}}>
            {renderRow(foundDs)}
          </View>
          <Text style={styles.title} color="green">
            Paired:
          </Text>
          {loading ? <ActivityIndicator animating={true} /> : null}
          <View style={{flex: 1, flexDirection: 'column'}}>
            {renderRow(pairedDs)}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingVertical: 30,
            }}>
            <Button
              disabled={loading || !bleOpend || !boundAddress}
              title="ESC/POS"
              onPress={async () => {
                try {
                  await BluetoothEscposPrinter.printerInit();
                  await BluetoothEscposPrinter.printerLeftSpace(0);
                  await BluetoothEscposPrinter.printerAlign(
                    BluetoothEscposPrinter.ALIGN.CENTER,
                  );
                  await BluetoothEscposPrinter.setBlob(0);
                  await BluetoothEscposPrinter.printText('Hello World\r\n', {
                    encoding: 'GBK',
                    codepage: 0,
                    widthtimes: 3,
                    heigthtimes: 3,
                    fonttype: 1,
                  });
                  await BluetoothEscposPrinter.setBlob(0);
                  await BluetoothEscposPrinter.printText('Welcome\r\n', {
                    encoding: 'GBK',
                    codepage: 0,
                    widthtimes: 0,
                    heigthtimes: 0,
                    fonttype: 1,
                  });
                } catch (e) {
                  console.log(e.message);
                  Alert.alert(e.message || 'ERROR');
                }

                console.log(
                  'Type : ESC/POS - ',
                  'Name : ',
                  name,
                  'Bound Address : ',
                  boundAddress,
                );
              }}
            />
            <Button
              disabled={loading || !(bleOpend && boundAddress.length > 0)}
              title="TSC"
              onPress={() => {
                console.log(
                  'Type : TCS - ',
                  'Name : ',
                  name,
                  'Bound Address : ',
                  boundAddress,
                );
              }}
            />
          </View>
        </ScrollView>
      </MainWrapper>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    width: width,
    padding: 10,
    textAlign: 'left',
  },
  wtf: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    textAlign: 'left',
    padding: 10,
  },
  address: {
    flex: 1,
    textAlign: 'right',
  },
});
