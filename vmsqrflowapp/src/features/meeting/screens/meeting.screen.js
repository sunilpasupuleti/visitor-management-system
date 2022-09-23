/* eslint-disable no-unreachable */
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
import {AuthenticationContext} from '../../../services/authentication/authentication.context';

import {View} from 'react-native';
import moment from 'moment';
import {SafeArea} from '../../../components/utility/safe-area.component';
import RNPrint from 'react-native-print';
import {useDispatch} from 'react-redux';
import {loaderActions} from '../../../store/loader-slice';

export const MeetingScreen = ({navigation, route}) => {
  const theme = useTheme();
  const [meeting, setMeeting] = useState(null);
  const [rejectedReasons, setRejectedReasons] = useState(null);
  const [rejectedModalVisible, setRejectedModalVisible] = useState(false);
  const {meetings, onUpdateMeetingStatus} = useContext(UserContext);
  const {userData} = useContext(AuthenticationContext);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const dispatch = useDispatch();
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

  const onUpdateStatus = async status => {
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
    onUpdateMeetingStatus(data, async result => {
      if (status === 'accepted') {
        await print(moment().format('DD-MMM-YYYY,  hh:mm a'));
      }
      navigation.goBack();
    });
  };

  async function print(inTime) {
    dispatch(loaderActions.showLoader({backdrop: true}));
    let meetingInTime = inTime
      ? inTime
      : meeting.status === 'completed' ||
        (meeting.status === 'accepted' && meeting.meetingAcceptedTime)
      ? moment(meeting.meetingAcceptedTime).format('DD-MMM-YYYY,  hh:mm a')
      : '-';

    let html = `
  <head>
<style>
  section {
    border: 1px solid black;
    padding: 0rem 0rem 2rem 0rem;
    margin:0rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .header .logo {
    width: 60;
    height: 60px;
    object-fit: cover;
  }
  .header .title {
    font-size: 18px;
    text-align: center;
  }

  .pass {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pass .title {
    font-size: 18px;
  }
  .pass .date {
    padding-right: 1rem;
  }

  table,
  .pass,
  .signatures {
    padding-left: 1rem;
  }

  .basic_table {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .visitor_img {
    height: 150px;
    width: 150px;
    object-fit: cover;
    border: 1px solid #ccc;
    margin-right: 3rem;
  }
  tr {
    display: flex;
    align-items: center;
    gap: 1rem;
  }


  tr td:first-child {
    font-weight : 500;
  }

  tr td:first-child {
    min-width: 150px;
  }

  td {
    padding: 0.2rem;
  }
  .signatures {
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }
</style>
</head>
<body>
<section>
  <div class="header">
    <img
      src="https://vms.webwizard.in/admin/logo_border.png"
      alt="logo"
      class="logo"
    />
    <h2 class="title">${userData.company.name}</h2>
  </div>
  <hr />
  <div class="pass">
    <h2 class="title">Visitor Pass</h2>
    <p class="date">${moment().format('DD-MMM-YYYY')}</p>
  </div>
  <hr />
  <div class="basic_table">
    <table>
      <tbody>
        <tr>
          <td>Name</td>
          <td>${meeting.visitor.name}</td>
        </tr>
        <tr>
          <td>Company</td>
          <td>${meeting.visitor.company.name}</td>
        </tr>
        <tr>
          <td>Address</td>
          <td>${meeting.visitor.address}</td>
        </tr>
        <tr>
          <td>Mobile</td>
          <td>${meeting.visitor.phone}</td>
        </tr>
        <tr>
          <td>Proof Type</td>
          <td>${meeting.visitor.idType}</td>
        </tr>
        <tr>
          <td>Vehicle number</td>
          <td>${meeting.vehicleNumber}</td>
        </tr>
        <tr>
          <td>No of Persons</td>
          <td>${meeting?.additionalMembers?.length}</td>
        </tr>
      </tbody>
    </table>

    <img
      src=${meeting.visitor.selfieLink}
      alt="logo"
      class="visitor_img"
    />
  </div>

  <hr />

  <table>
    <tbody>
      <tr>
        <td>Department</td>
        <td>${meeting.employee.department}</td>
      </tr>
      <tr>
        <td>To Meet</td>
        <td>${meeting.employee.name}</td>
      </tr>
      <tr>
        <td>Purpose</td>
        <td>${meeting.purpose}</td>
      </tr>
      <tr>
        <td>In Time</td>
        <td>${meetingInTime}</td>
      </tr>
      <tr>
        <td>Out Time</td>
        <td>${
          meeting.status === 'completed' && meeting.meetingEndTime
            ? moment(meeting.meetingEndTime).format('DD-MMM-YYYY,  hh:mm a')
            : '-'
        }</td>
      </tr>
    </tbody>
  </table>
  <br />
  <br /><br />
  <div class="signatures">
    <h3>Security signature</h3>

    <h3>Visitor signature</h3>

    <h3>Officer signature</h3>
  </div>
</section>
</body>
  `;

    await RNPrint.print({
      html: html,
    })
      .then(() => {
        dispatch(loaderActions.hideLoader());
      })
      .catch(err => {
        dispatch(loaderActions.hideLoader());
        console.log('Error ocured', err);
        Alert.alert(err.message);
      });
  }

  const onCloseRejectModal = () => {
    setRejectedModalVisible(false);
    setRejectedReasons(null);
  };

  return (
    meeting && (
      <SafeArea>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Portal>
              <Dialog
                visible={rejectedModalVisible}
                onDismiss={onCloseRejectModal}>
                <Dialog.Title>Rejected reasons ? </Dialog.Title>
                <Dialog.Content>
                  <TextInput
                    autoFocus
                    outlineColor="tomato"
                    activeOutlineColor="tomato"
                    selectionColor="tomato"
                    theme={{roundness: 10}}
                    mode="outlined"
                    returnKeyType="done"
                    onChangeText={n => setRejectedReasons(n)}
                    value={rejectedReasons}
                    placeholder="Enter your rejected reasons"
                    keyboardType="default"
                    right={
                      rejectedReasons && (
                        <TextInput.Icon
                          name="close-circle"
                          color="#bbb"
                          onPress={() => setRejectedReasons('')}
                        />
                      )
                    }
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    theme={{roundness: 10}}
                    mode="text"
                    style={{height: 40, marginRight: 10}}
                    color="#aaa"
                    labelStyle={{color: '#fff'}}
                    icon="close"
                    onPress={onCloseRejectModal}>
                    <ButtonText color="#aaa">Cancel </ButtonText>
                  </Button>

                  <Button
                    theme={{roundness: 10}}
                    mode="contained"
                    style={{height: 40}}
                    color="tomato"
                    labelStyle={{color: '#fff'}}
                    icon="close"
                    onPress={() => onUpdateStatus('rejected')}>
                    <ButtonText color="#fff">REJECT </ButtonText>
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>

          <MainWrapper>
            <>
              <VisitorImageWrapper>
                {/* <Text fontsize="20px">Meeting Details</Text> */}
                <Spacer size={'xlarge'} />
                <VisitorImage
                  source={{
                    uri: meeting.visitor?.selfieLink,
                  }}
                />
              </VisitorImageWrapper>
              <Spacer size={'xlarge'} />
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Title</DataTable.Title>
                  <DataTable.Title>Value</DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell>Name</DataTable.Cell>
                  <DataTable.Cell>
                    <Text>{meeting.visitor.name}</Text>
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell>Address</DataTable.Cell>
                  <DataTable.Cell>{meeting.visitor.address}</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell>Mobile</DataTable.Cell>
                  <DataTable.Cell>{meeting.visitor.phone}</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell>Proof Type</DataTable.Cell>
                  <DataTable.Cell>{meeting.visitor.idType}</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell>Vehicle Number</DataTable.Cell>
                  <DataTable.Cell>
                    {meeting.vehicleNumber ? meeting.vehicleNumber : '-'}
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Belongings</DataTable.Cell>
                  <DataTable.Cell>
                    {meeting.otherBelongings &&
                    meeting.otherBelongings.length > 0
                      ? meeting.otherBelongings
                      : '-'}
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Additional Members</DataTable.Cell>
                  <DataTable.Cell>
                    {meeting.additionalMembers
                      ? meeting.additionalMembers.length
                      : '-'}
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
              <Spacer size={'xlarge'} />
              <Text fontsize="20px">To Meet</Text>
              <Spacer size={'xlarge'} />
              <DataTable.Row>
                <DataTable.Cell>Department</DataTable.Cell>
                <DataTable.Cell>{meeting.employee?.department}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Name</DataTable.Cell>
                <DataTable.Cell>
                  <Text>{meeting.employee?.name}</Text>
                </DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Purpose</DataTable.Cell>
                <DataTable.Cell>{meeting.purpose}</DataTable.Cell>
              </DataTable.Row>
              {(meeting.status === 'completed' ||
                meeting.status === 'accepted') && (
                <DataTable.Row>
                  <DataTable.Cell>In Time</DataTable.Cell>
                  <DataTable.Cell>
                    <DataTable.Cell>
                      {meeting.meetingAcceptedTime
                        ? moment(meeting.meetingAcceptedTime).format(
                            'DD-MMM-YYYY,  hh:mm a',
                          )
                        : '-'}
                    </DataTable.Cell>
                  </DataTable.Cell>
                </DataTable.Row>
              )}

              {meeting.status === 'rejected' && (
                <>
                  <DataTable.Row>
                    <DataTable.Cell>Rejected Time</DataTable.Cell>
                    <DataTable.Cell>
                      <DataTable.Cell>
                        {meeting.meetingRejectedTime
                          ? moment(meeting.meetingRejectedTime).format(
                              'DD-MMM-YYYY,  hh:mm a',
                            )
                          : '-'}
                      </DataTable.Cell>
                    </DataTable.Cell>
                  </DataTable.Row>

                  <DataTable.Row>
                    <DataTable.Cell>Rejected reasons</DataTable.Cell>
                    <DataTable.Cell>
                      {meeting.rejectedReasons ? meeting.rejectedReasons : '-'}
                    </DataTable.Cell>
                  </DataTable.Row>
                </>
              )}
              {meeting.status === 'completed' && (
                <DataTable.Row>
                  <DataTable.Cell>Out Time</DataTable.Cell>
                  <DataTable.Cell>
                    {meeting.meetingEndTime
                      ? moment(meeting.meetingEndTime).format(
                          'DD-MMM-YYYY,  hh:mm a',
                        )
                      : '-'}
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </>

            <ActionsContainer>
              <Button
                theme={{roundness: 10}}
                mode="contained"
                style={{height: 40}}
                color={theme.colors.brand.primary}
                icon="printer"
                onPress={() => {
                  if (meeting.status === 'upcoming') {
                    onUpdateStatus('accepted');
                  } else {
                    print();
                  }
                }}>
                <ButtonText color="#fff">PRINT</ButtonText>
              </Button>
              <ButtonsContainer>
                {meeting.status === 'upcoming' && (
                  <Spacer position={'right'}>
                    <Button
                      theme={{roundness: 10}}
                      mode="outlined"
                      style={{height: 40, width: '100%'}}
                      color="tomato"
                      icon="close"
                      onPress={() => setRejectedModalVisible(true)}>
                      <ButtonText color="tomato">REJECT </ButtonText>
                    </Button>
                  </Spacer>
                )}

                {(meeting.status === 'upcoming' ||
                  meeting.status === 'accepted') && (
                  <Spacer position={'left'} size={'large'}>
                    <Button
                      theme={{roundness: 10}}
                      mode="outlined"
                      style={{height: 40, width: '100%'}}
                      color="#33B996"
                      icon="logout"
                      onPress={() => onUpdateStatus('completed')}>
                      <ButtonText color="#33B996">SIGN OUT </ButtonText>
                    </Button>
                  </Spacer>
                )}
              </ButtonsContainer>
            </ActionsContainer>
          </MainWrapper>
        </ScrollView>
      </SafeArea>
    )
  );
};
