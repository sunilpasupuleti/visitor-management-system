import React from 'react';
import {Button, TextInput} from 'react-native-paper';
import styled from 'styled-components/native';
import {Text} from '../../../components/typography/text.component';
import {colors} from '../../../infrastructure/theme/colors';

export const AccountBackground = styled.ImageBackground.attrs({
  source: require('../../../../assets/expenses.jpg'),
})`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Title = styled(Text)`
  font-size: 30px;
`;

export const AccountContainer = styled.ScrollView`
  padding: ${props => props.theme.space[4]};
  margin-top: 0px;
  flex: 1;
`;

export const AuthButton = styled(Button).attrs({})`
  padding: ${props => props.theme.space[2]};
  border-radius: 12px;
`;

export const LoginInput = styled(TextInput).attrs({
  activeOutlineColor: 'transparent',
  outlineColor: 'transparent',
  selectionColor: colors.brand.primary,
})`
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

export const Hyperlink = styled(Text).attrs({
  fontfamily: 'heading',
})`
  color: #3a62b6;
  text-align: center;
`;
