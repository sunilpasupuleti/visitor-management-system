/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {useEffect} from 'react';
import {Alert, ScrollView, TouchableOpacity} from 'react-native';
import {useTheme} from 'styled-components/native';
import {ButtonText, FlexRow, MainWrapper} from '../../../components/styles';
import {Text} from '../../../components/typography/text.component';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Spacer} from '../../../components/spacer/spacer.component';
import {
  ActionsContainer,
  ButtonsContainer,
  VisitorImage,
  VisitorImageWrapper,
} from '../components/meeting.styles';
import {Button, DataTable, Dialog, Portal, TextInput} from 'react-native-paper';
import {UserContext} from '../../../services/user/user.context';
import {View} from 'react-native';
import moment from 'moment';
import {SafeArea} from '../../../components/utility/safe-area.component';
import {BluetoothScreen} from './bluetooth.screen';

export const MeetingScreen = ({navigation, route}) => {
  const theme = useTheme();
  const [meeting, setMeeting] = useState(null);
  const [rejectedReasons, setRejectedReasons] = useState(null);
  const [rejectedModalVisible, setRejectedModalVisible] = useState(false);
  const {meetings, onUpdateMeetingStatus} = useContext(UserContext);

  useEffect(() => {
    if (route.params && route.params.meetingId) {
      let filteredMeeting = meetings.filter(
        m => m._id === route.params.meetingId,
      )[0];
      setMeeting(filteredMeeting);
    }
  }, [route.params, meetings]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Meeting Details',
      headerLeft: () => {
        if (meeting) {
          let color =
            meeting.status === 'completed'
              ? 'green'
              : meeting.status === 'rejected'
              ? 'tomato'
              : meeting.status === 'accepted'
              ? 'gold'
              : theme.colors.brand.primary;
          return (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FlexRow>
                <Ionicons name="chevron-back-outline" size={25} color={color} />
                <Text color={color}>Back</Text>
              </FlexRow>
            </TouchableOpacity>
          );
        } else {
          return (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FlexRow>
                <Ionicons
                  name="chevron-back-outline"
                  size={25}
                  color={theme.colors.brand.primary}
                />
                <Text color={theme.colors.brand.primary}>Back</Text>
              </FlexRow>
            </TouchableOpacity>
          );
        }
      },

      headerRight: () => {
        if (meeting) {
          let color =
            meeting.status === 'completed'
              ? 'green'
              : meeting.status === 'rejected'
              ? 'tomato'
              : meeting.status === 'accepted'
              ? 'gold'
              : theme.colors.brand.primary;

          return (
            <Text
              style={{
                marginRight: 20,
                textTransform: 'capitalize',
              }}
              color={color}>
              {meeting.status === 'accepted' ? 'on going' : meeting.status}
            </Text>
          );
        } else {
          return null;
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, meeting]);

  const onUpdateStatus = status => {
    let data = {
      status: status,
      meetingId: meeting._id,
    };
    if (status === 'rejected') {
      if (!rejectedReasons.trim()) {
        Alert.alert('Rejected reasons required');
        return;
      } else {
        data.rejectedReasons = rejectedReasons.trim();
      }
    }

    if (status === 'completed') {
      data.meetingEndTime = new Date().toISOString();
    }
    onCloseRejectModal();
    onUpdateMeetingStatus(data, result => {
      navigation.goBack();
    });
  };

  const onCloseRejectModal = () => {
    setRejectedModalVisible(false);
    setRejectedReasons(null);
  };

  return <BluetoothScreen />;

  // return (
  //   meeting && (
  //     <SafeArea>
  //       <ScrollView showsVerticalScrollIndicator={false}>
  //         <View>
  //           <Portal>
  //             <Dialog
  //               visible={rejectedModalVisible}
  //               onDismiss={onCloseRejectModal}>
  //               <Dialog.Title>Rejected reasons ? </Dialog.Title>
  //               <Dialog.Content>
  //                 <TextInput
  //                   autoFocus
  //                   outlineColor="tomato"
  //                   activeOutlineColor="tomato"
  //                   selectionColor="tomato"
  //                   theme={{roundness: 10}}
  //                   mode="outlined"
  //                   returnKeyType="done"
  //                   onChangeText={n => setRejectedReasons(n)}
  //                   value={rejectedReasons}
  //                   placeholder="Enter your rejected reasons"
  //                   keyboardType="default"
  //                   right={
  //                     rejectedReasons && (
  //                       <TextInput.Icon
  //                         name="close-circle"
  //                         color="#bbb"
  //                         onPress={() => setRejectedReasons('')}
  //                       />
  //                     )
  //                   }
  //                 />
  //               </Dialog.Content>
  //               <Dialog.Actions>
  //                 <Button
  //                   theme={{roundness: 10}}
  //                   mode="text"
  //                   style={{height: 40, marginRight: 10}}
  //                   color="#aaa"
  //                   labelStyle={{color: '#fff'}}
  //                   icon="close"
  //                   onPress={onCloseRejectModal}>
  //                   <ButtonText color="#aaa">Cancel </ButtonText>
  //                 </Button>

  //                 <Button
  //                   theme={{roundness: 10}}
  //                   mode="contained"
  //                   style={{height: 40}}
  //                   color="tomato"
  //                   labelStyle={{color: '#fff'}}
  //                   icon="close"
  //                   onPress={() => onUpdateStatus('rejected')}>
  //                   <ButtonText color="#fff">REJECT </ButtonText>
  //                 </Button>
  //               </Dialog.Actions>
  //             </Dialog>
  //           </Portal>
  //         </View>

  //         <MainWrapper>
  //           <>
  //             <VisitorImageWrapper>
  //               {/* <Text fontsize="20px">Meeting Details</Text> */}
  //               <Spacer size={'xlarge'} />
  //               <VisitorImage
  //                 source={{
  //                   uri: meeting.visitor?.selfieLink,
  //                 }}
  //               />
  //             </VisitorImageWrapper>
  //             <Spacer size={'xlarge'} />
  //             <DataTable>
  //               <DataTable.Header>
  //                 <DataTable.Title>Title</DataTable.Title>
  //                 <DataTable.Title>Value</DataTable.Title>
  //               </DataTable.Header>

  //               <DataTable.Row>
  //                 <DataTable.Cell>Name</DataTable.Cell>
  //                 <DataTable.Cell>
  //                   <Text>{meeting.visitor.name}</Text>
  //                 </DataTable.Cell>
  //               </DataTable.Row>

  //               <DataTable.Row>
  //                 <DataTable.Cell>Address</DataTable.Cell>
  //                 <DataTable.Cell>{meeting.visitor.address}</DataTable.Cell>
  //               </DataTable.Row>

  //               <DataTable.Row>
  //                 <DataTable.Cell>Mobile</DataTable.Cell>
  //                 <DataTable.Cell>{meeting.visitor.phone}</DataTable.Cell>
  //               </DataTable.Row>

  //               <DataTable.Row>
  //                 <DataTable.Cell>Proof Type</DataTable.Cell>
  //                 <DataTable.Cell>{meeting.visitor.idType}</DataTable.Cell>
  //               </DataTable.Row>

  //               <DataTable.Row>
  //                 <DataTable.Cell>Vehicle Number</DataTable.Cell>
  //                 <DataTable.Cell>
  //                   {meeting.vehicleNumber ? meeting.vehicleNumber : '-'}
  //                 </DataTable.Cell>
  //               </DataTable.Row>
  //               <DataTable.Row>
  //                 <DataTable.Cell>Belongings</DataTable.Cell>
  //                 <DataTable.Cell>
  //                   {meeting.otherBelongings &&
  //                   meeting.otherBelongings.length > 0
  //                     ? meeting.otherBelongings
  //                     : '-'}
  //                 </DataTable.Cell>
  //               </DataTable.Row>
  //               <DataTable.Row>
  //                 <DataTable.Cell>Additional Members</DataTable.Cell>
  //                 <DataTable.Cell>
  //                   {meeting.additionalMembers
  //                     ? meeting.additionalMembers.length
  //                     : '-'}
  //                 </DataTable.Cell>
  //               </DataTable.Row>

  //               {meeting.status === 'rejected' && (
  //                 <DataTable.Row>
  //                   <DataTable.Cell>Rejected reasons</DataTable.Cell>
  //                   <DataTable.Cell>
  //                     {meeting.rejectedReasons ? meeting.rejectedReasons : '-'}
  //                   </DataTable.Cell>
  //                 </DataTable.Row>
  //               )}
  //             </DataTable>
  //             <Spacer size={'xlarge'} />
  //             <Text fontsize="20px">To Meet</Text>
  //             <Spacer size={'xlarge'} />
  //             <DataTable.Row>
  //               <DataTable.Cell>Department</DataTable.Cell>
  //               <DataTable.Cell>{meeting.employee?.department}</DataTable.Cell>
  //             </DataTable.Row>
  //             <DataTable.Row>
  //               <DataTable.Cell>Name</DataTable.Cell>
  //               <DataTable.Cell>
  //                 <Text>{meeting.employee?.name}</Text>
  //               </DataTable.Cell>
  //             </DataTable.Row>
  //             <DataTable.Row>
  //               <DataTable.Cell>Purpose</DataTable.Cell>
  //               <DataTable.Cell>{meeting.purpose}</DataTable.Cell>
  //             </DataTable.Row>
  //             {(meeting.status === 'completed' ||
  //               meeting.status === 'accepted') && (
  //               <DataTable.Row>
  //                 <DataTable.Cell>In Time</DataTable.Cell>
  //                 <DataTable.Cell>
  //                   <DataTable.Cell>
  //                     {meeting.meetingAcceptedTime
  //                       ? moment(meeting.meetingAcceptedTime).format(
  //                           'DD-MMM-YYYY,  hh:mm a',
  //                         )
  //                       : '-'}
  //                   </DataTable.Cell>
  //                 </DataTable.Cell>
  //               </DataTable.Row>
  //             )}

  //             {meeting.status === 'rejected' && (
  //               <DataTable.Row>
  //                 <DataTable.Cell>Rejected Time</DataTable.Cell>
  //                 <DataTable.Cell>
  //                   <DataTable.Cell>
  //                     {meeting.meetingRejectedTime
  //                       ? moment(meeting.meetingRejectedTime).format(
  //                           'DD-MMM-YYYY,  hh:mm a',
  //                         )
  //                       : '-'}
  //                   </DataTable.Cell>
  //                 </DataTable.Cell>
  //               </DataTable.Row>
  //             )}
  //             {meeting.status === 'completed' && (
  //               <DataTable.Row>
  //                 <DataTable.Cell>Out Time</DataTable.Cell>
  //                 <DataTable.Cell>
  //                   {meeting.meetingEndTime
  //                     ? moment(meeting.meetingEndTime).format(
  //                         'DD-MMM-YYYY,  hh:mm a',
  //                       )
  //                     : '-'}
  //                 </DataTable.Cell>
  //               </DataTable.Row>
  //             )}
  //           </>

  //           <ActionsContainer>
  //             <Button
  //               theme={{roundness: 10}}
  //               mode="contained"
  //               style={{height: 40}}
  //               color={theme.colors.brand.primary}
  //               icon="printer"
  //               onPress={() => onUpdateStatus('accepted')}>
  //               <ButtonText color="#fff">PRINT</ButtonText>
  //             </Button>
  //             <ButtonsContainer>
  //               {meeting.status === 'upcoming' && (
  //                 <Spacer position={'right'}>
  //                   <Button
  //                     theme={{roundness: 10}}
  //                     mode="outlined"
  //                     style={{height: 40, width: '100%'}}
  //                     color="tomato"
  //                     icon="close"
  //                     onPress={() => setRejectedModalVisible(true)}>
  //                     <ButtonText color="tomato">REJECT </ButtonText>
  //                   </Button>
  //                 </Spacer>
  //               )}

  //               {meeting.status === 'upcoming' && (
  //                 <Spacer position={'left'} size={'large'}>
  //                   <Button
  //                     theme={{roundness: 10}}
  //                     mode="outlined"
  //                     style={{height: 40, width: '100%'}}
  //                     color="#33B996"
  //                     icon="logout"
  //                     onPress={() => onUpdateStatus('completed')}>
  //                     <ButtonText color="#33B996">SIGN OUT </ButtonText>
  //                   </Button>
  //                 </Spacer>
  //               )}
  //             </ButtonsContainer>
  //           </ActionsContainer>
  //         </MainWrapper>
  //       </ScrollView>
  //     </SafeArea>
  //   )
  // );
};
