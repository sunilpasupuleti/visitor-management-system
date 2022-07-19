/* eslint-disable quotes */
import styled from 'styled-components/native';
import {Text} from '../../../components/typography/text.component';
export const MeetingName = styled(Text)`
  font-size: 19px;
  ${props => props.archived && `color : #aaa`}
`;

export const BorderLine = styled.View`
  border-bottom-color: #ccc;
  border-bottom-width: 0.5px;
`;

export const UpdatedTime = styled(Text).attrs({
  fontfamily: 'heading',
  fontsize: '13px',
})`
  ${props => props.showTotalBalance && `margin-left : 20px`};
  ${props => (props.archived ? `color : #aaa` : ` color: #8a8a8d`)}
`;

export const MeetingInfoWrapper = styled.View`
  flex-direction: row;
  max-width: 80%;
  margin: 16px 0px 16px 16px;
`;

export const VisitorImageWrapper = styled.View``;

export const VisitorImage = styled.Image`
  height: 80px;
  width: 80px;
  border-radius: 100px;
`;
