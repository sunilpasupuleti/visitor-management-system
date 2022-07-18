/* eslint-disable react/react-in-jsx-scope */
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useTheme} from 'styled-components/native';
import {MainWrapper} from '../../../components/styles';
import {Text} from '../../../components/typography/text.component';
import {SafeArea} from '../../../components/utility/safe-area.component';
import {IconsContainer, UpperIcon} from '../components/home.styles';

export const HomeScreen = ({navigation}) => {
  const theme = useTheme();
  return (
    <SafeArea main={false}>
      <MainWrapper>
        <IconsContainer>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <UpperIcon
              name="md-cog-outline"
              size={30}
              color={theme.colors.brand.primary}
            />
          </TouchableOpacity>
        </IconsContainer>
      </MainWrapper>
    </SafeArea>
  );
};
