/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {useTheme} from 'styled-components/native';
import {Spacer} from '../../../components/spacer/spacer.component';
import {MainWrapper} from '../../../components/styles';
import {Text} from '../../../components/typography/text.component';
import {SafeArea} from '../../../components/utility/safe-area.component';
import {IconsContainer, UpperIcon} from '../components/home.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {MeetingsInfo} from '../components/meetings-info.component';
import {UserContext} from '../../../services/user/user.context';

export const HomeScreen = ({navigation}) => {
  const theme = useTheme();
  const [searchKeyword, setSearchKeyword] = useState('');
  const {meetings} = useContext(UserContext);

  return (
    <SafeArea main={false}>
      <ScrollView>
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

          <Spacer size={'large'} />
          <Text fontfamily="bodyBold" fontsize="30px">
            Meetings
          </Text>

          <Spacer size={'xlarge'} />

          {meetings && meetings.length > 0 && (
            <Spacer position={'bottom'} size="xlarge">
              <Searchbar
                value={searchKeyword}
                theme={{roundness: 10}}
                style={{elevation: 2}}
                placeholder="Search"
                onChangeText={k => setSearchKeyword(k)}
                clearIcon={() =>
                  searchKeyword !== '' && (
                    <Ionicons
                      onPress={() => setSearchKeyword('')}
                      name="close-circle-outline"
                      size={25}
                      color={theme.colors.brand.primary}
                    />
                  )
                }
              />
              <MeetingsInfo
                navigation={navigation}
                searchKeyword={searchKeyword}
              />
            </Spacer>
          )}
        </MainWrapper>
      </ScrollView>

      {(!meetings || meetings.length === 0) && (
        <Text
          style={{
            position: 'absolute',
            flex: 1,
            top: '50%',
            left: '15%',
            transform: [
              {
                translateY: -50,
              },
            ],
            color: theme.colors.text.primary,
            fontSize: 20,
          }}>
          There are no meetings to show.
        </Text>
      )}
    </SafeArea>
  );
};
