import React from 'react';
import {TouchableHighlight} from 'react-native';
import {Spacer} from '../../../components/spacer/spacer.component';
import {FlexRow} from '../../../components/styles';
import {
  MeetingInfoWrapper,
  MeetingName,
  UpdatedTime,
  VisitorImage,
  VisitorImageWrapper,
} from './meeting-info-card.styles';
import moment from 'moment';
import {useTheme} from 'styled-components/native';

export const MeetingInfoCard = ({navigation, meeting, index}) => {
  const theme = useTheme();
  return (
    <TouchableHighlight
      onPress={() =>
        navigation.navigate('Meeting', {
          meetingId: meeting._id,
        })
      }
      underlayColor={theme.colors.touchable.highlight}>
      <FlexRow justifyContent="space-between">
        <MeetingInfoWrapper>
          <VisitorImageWrapper>
            <VisitorImage
              source={{
                uri: meeting?.visitor?.selfieLink,
              }}
            />
          </VisitorImageWrapper>
        </MeetingInfoWrapper>
        <Spacer size={'xlarge'} position="right">
          <MeetingName>{meeting.visitor.name}</MeetingName>
          <Spacer size={'medium'} position="top" />
          <UpdatedTime>
            {moment(meeting.meetingRaisedTime).calendar()}
          </UpdatedTime>
        </Spacer>
      </FlexRow>
      {/* {sheets.length - 1 != index && <BorderLine />} */}
    </TouchableHighlight>
  );
};
