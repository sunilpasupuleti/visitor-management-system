import styled from 'styled-components/native';
import {Text} from '../../../components/typography/text.component';

export const CardColor = styled.View`
  position: absolute;
  left: 0px;
  height: 100%;
  width: 5px;
  border-radius: 10px;
  ${props => props.color && `background-color : ${props.color}`}
`;

export const CardCategoryName = styled(Text).attrs({
  fontfamily: 'heading',
})`
  font-size: 17px;
`;
