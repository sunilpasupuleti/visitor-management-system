/* eslint-disable react-native/no-inline-styles */
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import {View} from 'react-native';
import {ProgressBar} from 'react-native-paper';

import {CardCategoryName, CardColor} from './dashboard.styles';
import {FlexRow} from '../../../components/styles';
import {Spacer} from '../../../components/spacer/spacer.component';
import {Text} from '../../../components/typography/text.component';

export const ChartInfoCard = ({color, name, percentage}) => {
  return (
    <>
      <View style={{marginRight: 10}}>
        <CardColor color={color} />
        <FlexRow justifyContent="space-between">
          <Spacer position={'left'} size={'large'}>
            <CardCategoryName>{name} </CardCategoryName>
          </Spacer>
          <FlexRow>
            <Text color="#8a8a8d" fontfamily="bodyBold">
              {Math.round(percentage * 100).toString() + '%'}{' '}
            </Text>
          </FlexRow>
        </FlexRow>
        <Spacer position={'left'} size={'large'}>
          <Spacer />
        </Spacer>

        <Spacer size={'large'} />
      </View>
      <Spacer size={'large'} />
    </>
  );
};
