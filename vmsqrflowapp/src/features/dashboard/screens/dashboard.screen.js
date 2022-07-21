/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {MainWrapper} from '../../../components/styles';
import {Text} from '../../../components/typography/text.component';
import {SafeArea} from '../../../components/utility/safe-area.component';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from 'styled-components/native';
import {UserContext} from '../../../services/user/user.context';
import {useDispatch} from 'react-redux';
import {notificationActions} from '../../../store/notification-slice';
import {VictoryPie} from 'victory-native';
import {Dimensions, ScrollView} from 'react-native';
import {ChartInfoCard} from '../components/chart-info-card.component';
import {Spacer} from '../../../components/spacer/spacer.component';
import {Divider} from 'react-native-paper';

export const DashboardScreen = ({navigation}) => {
  const theme = useTheme();
  const {onGetDashboard} = useContext(UserContext);
  const [dashboard, setDashboard] = useState(null);
  const [chartData, setChartData] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Dashboard',
      headerRight: () => (
        <Ionicons
          onPress={() => navigation.goBack()}
          style={{marginRight: 10}}
          name="close-circle-outline"
          size={30}
          color={theme.colors.brand.primary}
        />
      ),
      headerLeft: () => null,
    });

    onGetDashboard(
      result => {
        setDashboard(result);
        onSetChartData(result);
      },
      err => {
        dispatch(
          notificationActions.showToast({
            status: 'error',
            message: err.message ? err.message : 'Error in getting data',
          }),
        );
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let keyValues = {
    today: {
      name: 'Today',
      color: '#33B996',
    },
    thisWeek: {
      name: 'This Week',
      color: '#2fb0c7',
    },
    thisMonth: {
      name: 'This Month',
      color: '#5756d5',
    },
    thisYear: {
      name: 'This Year',
      color: '#007aff',
    },
  };

  const onSetChartData = result => {
    let data = {
      totalMeetingsDone: {
        datasets: [],
        colors: [],
        total: 0,
      },
      totalRejectedMeetings: {
        datasets: [],
        colors: [],
        total: 0,
      },
    };

    if (result && result.totalMeetingsDone) {
      let totMeet = result.totalMeetingsDone;
      let totRejMeet = result.totalRejectedMeetings;
      Object.keys(totMeet).map((key, index) => {
        let number = totMeet[key];
        let dataset = {
          y: number,
          x: keyValues[key].name,
        };
        data.totalMeetingsDone.total += number;
        data.totalMeetingsDone.colors.push(keyValues[key].color);
        data.totalMeetingsDone.datasets.push(dataset);
      });

      Object.keys(totRejMeet).map((key, index) => {
        let number = totRejMeet[key];
        let dataset = {
          y: number,
          x: keyValues[key].name,
        };
        data.totalRejectedMeetings.total += number;
        data.totalRejectedMeetings.colors.push(keyValues[key].color);
        data.totalRejectedMeetings.datasets.push(dataset);
      });
    }

    setChartData(data);
  };

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <ScrollView>
      {chartData && (
        <MainWrapper>
          {chartData.totalMeetingsDone && (
            <>
              <Text
                fontfamily="heading"
                fontsize="20px"
                style={{textAlign: 'center'}}>
                Meetings Done
              </Text>
              <Spacer size={'large'} />
              <VictoryPie
                data={chartData.totalMeetingsDone.datasets}
                width={Dimensions.get('window').width}
                height={280}
                innerRadius={50}
                colorScale={chartData.totalMeetingsDone.colors}
                style={{
                  labels: {
                    fill: theme.colors.text.primary,
                    fontSize: 15,
                    padding: 7,
                  },
                }}
              />

              {Object.keys(chartData.totalMeetingsDone.datasets).map(
                (key, index) => {
                  let dataset = chartData.totalMeetingsDone.datasets[index];
                  let color = chartData.totalMeetingsDone.colors[index];
                  let total = chartData.totalMeetingsDone.total;
                  let percentage = dataset.y / total;
                  return (
                    <ChartInfoCard
                      key={index}
                      percentage={percentage}
                      color={color}
                      name={dataset.x + ' ( ' + dataset.y + ' )'}
                    />
                  );
                },
              )}
            </>
          )}
          <Divider />
          <Spacer size={'large'} />
          {chartData.totalRejectedMeetings && (
            <>
              <Text
                fontfamily="heading"
                fontsize="20px"
                style={{textAlign: 'center'}}>
                Rejected Meetings
              </Text>
              <Spacer size={'large'} />
              <VictoryPie
                data={chartData.totalRejectedMeetings.datasets}
                width={Dimensions.get('window').width}
                height={280}
                innerRadius={50}
                colorScale={chartData.totalRejectedMeetings.colors}
                style={{
                  labels: {
                    fill: theme.colors.text.primary,
                    fontSize: 15,
                    padding: 7,
                  },
                }}
              />

              {Object.keys(chartData.totalRejectedMeetings.datasets).map(
                (key, index) => {
                  let dataset = chartData.totalRejectedMeetings.datasets[index];
                  let color = chartData.totalRejectedMeetings.colors[index];
                  let total = chartData.totalRejectedMeetings.total;
                  let percentage = dataset.y / total;
                  return (
                    <ChartInfoCard
                      key={index}
                      percentage={percentage}
                      color={color}
                      name={dataset.x + ' ( ' + dataset.y + ' )'}
                    />
                  );
                },
              )}
            </>
          )}
        </MainWrapper>
      )}
    </ScrollView>
  );
};
