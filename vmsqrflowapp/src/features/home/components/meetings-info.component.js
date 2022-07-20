/* eslint-disable no-unused-vars */
import React, {useContext, useEffect, useState} from 'react';
import {Spacer} from '../../../components/spacer/spacer.component';
import {Card} from 'react-native-paper';
import {FadeInView} from '../../../components/animations/fade.animation';
import {MeetingInfoCard} from './meeting-info-card.component';
import {UserContext} from '../../../services/user/user.context';
import {useTheme} from 'styled-components/native';
import {FlexRow} from '../../../components/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Haptics from 'react-native-haptic-feedback';
import {Text} from '../../../components/typography/text.component';

export const MeetingsInfo = ({navigation, searchKeyword}) => {
  const theme = useTheme();

  const {meetings} = useContext(UserContext);
  const [filteredMeetings, setFilteredMeetings] = useState([]);

  const [completedMeetings, setCompletedMeetings] = useState({
    meetings: [],
    pinOpened: false,
  });
  const [rejectedMeetings, setRejectedMeetings] = useState({
    meetings: [],
    pinOpened: false,
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState({
    meetings: [],
    pinOpened: true,
  });
  const [onGoingMeetings, setOnGoingMeetings] = useState({
    meetings: [],
    pinOpened: false,
  });

  useEffect(() => {
    setFilteredMeetings(meetings);
    if (searchKeyword !== '') {
      let filtered = meetings.filter(m => {
        return m.visitor.name
          .toLowerCase()
          .includes(searchKeyword.trim().toLowerCase());
      });
      setFilteredMeetings(filtered);
      groupMeetings(filtered);
    } else {
      groupMeetings(meetings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword]);

  useEffect(() => {
    if (meetings && meetings.length > 0) {
      groupMeetings(meetings);
    }
  }, [meetings]);

  const groupMeetings = meetingsPassed => {
    let completed = meetingsPassed.filter(m => m.status === 'completed');
    let rejected = meetingsPassed.filter(m => m.status === 'rejected');
    let upcoming = meetingsPassed.filter(m => m.status === 'upcoming');
    let onGoing = meetingsPassed.filter(m => m.status === 'accepted');
    setUpcomingMeetings(p => ({
      ...p,
      meetings: upcoming,
    }));
    setRejectedMeetings(p => ({
      ...p,
      meetings: rejected,
    }));
    setCompletedMeetings(p => ({
      ...p,
      meetings: completed,
    }));
    setOnGoingMeetings(p => ({
      ...p,
      meetings: onGoing,
    }));
  };

  const onShowPinned = status => {
    if (status === 'upcoming') {
      setUpcomingMeetings(p => ({
        ...p,
        pinOpened: !p.pinOpened,
      }));
    }

    if (status === 'completed') {
      setCompletedMeetings(p => ({
        ...p,
        pinOpened: !p.pinOpened,
      }));
    }
    if (status === 'rejected') {
      setRejectedMeetings(p => ({
        ...p,
        pinOpened: !p.pinOpened,
      }));
    }
    if (status === 'ongoing') {
      setOnGoingMeetings(p => ({
        ...p,
        pinOpened: !p.pinOpened,
      }));
    }
  };

  return (
    <>
      <Spacer>
        {/* for upcoming meeting */}
        {upcomingMeetings.meetings && upcomingMeetings.meetings.length > 0 && (
          <Spacer size={'xlarge'}>
            <FlexRow justifyContent="space-between">
              <Text fontfamily="bodyMedium">Upcoming</Text>
              <Ionicons
                onPress={() => {
                  Haptics.trigger('impactMedium', {
                    ignoreAndroidSystemSettings: true,
                  });
                  onShowPinned('upcoming');
                }}
                color={theme.colors.brand.primary}
                name={
                  upcomingMeetings.pinOpened
                    ? 'chevron-down-outline'
                    : 'chevron-forward-outline'
                }
                size={25}
              />
            </FlexRow>
            {upcomingMeetings.pinOpened && (
              <Spacer position={'top'} size="large">
                <Card theme={{roundness: 15}}>
                  {upcomingMeetings.meetings.map((meeting, index) => {
                    return (
                      <FadeInView key={meeting._id}>
                        <MeetingInfoCard
                          navigation={navigation}
                          meeting={meeting}
                          index={index}
                        />
                      </FadeInView>
                    );
                  })}
                </Card>
              </Spacer>
            )}
          </Spacer>
        )}

        {/* for ongoing meeting */}
        {onGoingMeetings.meetings && onGoingMeetings.meetings.length > 0 && (
          <Spacer size={'xlarge'}>
            <FlexRow justifyContent="space-between">
              <Text fontfamily="bodyMedium">On Going</Text>
              <Ionicons
                onPress={() => {
                  Haptics.trigger('impactMedium', {
                    ignoreAndroidSystemSettings: true,
                  });
                  onShowPinned('ongoing');
                }}
                color={theme.colors.brand.primary}
                name={
                  onGoingMeetings.pinOpened
                    ? 'chevron-down-outline'
                    : 'chevron-forward-outline'
                }
                size={25}
              />
            </FlexRow>
            {onGoingMeetings.pinOpened && (
              <Spacer position={'top'} size="large">
                <Card theme={{roundness: 15}}>
                  {onGoingMeetings.meetings.map((meeting, index) => {
                    return (
                      <FadeInView key={meeting._id}>
                        <MeetingInfoCard
                          navigation={navigation}
                          meeting={meeting}
                          index={index}
                        />
                      </FadeInView>
                    );
                  })}
                </Card>
              </Spacer>
            )}
          </Spacer>
        )}

        {/* for completed meeting */}
        {completedMeetings.meetings && completedMeetings.meetings.length > 0 && (
          <Spacer size={'xlarge'}>
            <FlexRow justifyContent="space-between">
              <Text fontfamily="bodyMedium">Completed</Text>
              <Ionicons
                onPress={() => {
                  Haptics.trigger('impactMedium', {
                    ignoreAndroidSystemSettings: true,
                  });
                  onShowPinned('completed');
                }}
                color={theme.colors.brand.primary}
                name={
                  completedMeetings.pinOpened
                    ? 'chevron-down-outline'
                    : 'chevron-forward-outline'
                }
                size={25}
              />
            </FlexRow>
            {completedMeetings.pinOpened && (
              <Spacer position={'top'} size="large">
                <Card theme={{roundness: 15}}>
                  {completedMeetings.meetings.map((meeting, index) => {
                    return (
                      <FadeInView key={meeting._id}>
                        <MeetingInfoCard
                          navigation={navigation}
                          meeting={meeting}
                          index={index}
                        />
                      </FadeInView>
                    );
                  })}
                </Card>
              </Spacer>
            )}
          </Spacer>
        )}

        {/* for rejected meeting */}
        {rejectedMeetings.meetings && rejectedMeetings.meetings.length > 0 && (
          <Spacer size={'xlarge'}>
            <FlexRow justifyContent="space-between">
              <Text fontfamily="bodyMedium">Rejected</Text>
              <Ionicons
                onPress={() => {
                  Haptics.trigger('impactMedium', {
                    ignoreAndroidSystemSettings: true,
                  });
                  onShowPinned('rejected');
                }}
                color={theme.colors.brand.primary}
                name={
                  rejectedMeetings.pinOpened
                    ? 'chevron-down-outline'
                    : 'chevron-forward-outline'
                }
                size={25}
              />
            </FlexRow>
            {rejectedMeetings.pinOpened && (
              <Spacer position={'top'} size="large">
                <Card theme={{roundness: 15}}>
                  {rejectedMeetings.meetings.map((meeting, index) => {
                    return (
                      <FadeInView key={meeting._id}>
                        <MeetingInfoCard
                          navigation={navigation}
                          meeting={meeting}
                          index={index}
                        />
                      </FadeInView>
                    );
                  })}
                </Card>
              </Spacer>
            )}
          </Spacer>
        )}
      </Spacer>
    </>
  );
};
