/* eslint-disable react-native/no-inline-styles */
import React, {useEffect} from 'react';
import {useContext, useState} from 'react';
import {Image, View} from 'react-native';
import {Spacer} from '../../../components/spacer/spacer.component';
import {AuthenticationContext} from '../../../services/authentication/authentication.context';
import {AccountContainer, LoginInput} from '../components/account.styles';

import {Text} from '../../../components/typography/text.component';
import {Button} from 'react-native-paper';
import {SafeArea} from '../../../components/utility/safe-area.component';
import {ErrorMessage, SuccessMessage} from '../../../components/styles';
import {useTheme} from 'styled-components/native';

export const AccountScreen = ({navigation}) => {
  const [email, setEmail] = useState({value: null, error: false});
  const [password, setPassword] = useState({value: null, error: false});

  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const theme = useTheme();
  const {onSignInWithEmail} = useContext(AuthenticationContext);

  const onClickSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (
      !email.value ||
      email.value === '' ||
      !password.value ||
      password.value === ''
    ) {
      return;
    }

    onSignInWithEmail(
      email.value.toLowerCase(),
      password.value,
      result => {
        onResetAllValues();
      },
      err => {
        setError(err);
      },
    );
  };

  const onResetAllValues = () => {
    setEmail({value: null, error: false});
    setPassword({value: null, error: false});
    setShowPassword(true);
    setError(null);
  };

  useEffect(() => {
    let showEmailError = false;
    let showPasswordError = false;
    if (email.value === '') {
      showEmailError = true;
    }
    if (password.value === '') {
      showPasswordError = true;
    }
    setEmail(p => ({...p, error: showEmailError}));
    setPassword(p => ({...p, error: showPasswordError}));
  }, [email.value, password.value]);

  return (
    <SafeArea>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 50,
          marginBottom: 10,
        }}>
        <Image
          style={{
            width: 160,
            height: 160,
            borderRadius: 100,
            borderColor: '#ddd',
            borderWidth: 1,
          }}
          source={require('../../../../assets/login-screen.png')}
        />
      </View>

      <Text
        fontfamily="bodyBold"
        style={{textAlign: 'center'}}
        color={theme.colors.text.primary}
        fontsize="25px">
        Vms
      </Text>
      <AccountContainer showsVerticalScrollIndicator={false}>
        {error && <ErrorMessage fontsize="13px">{error.message}</ErrorMessage>}
        {success && success.message && (
          <SuccessMessage fontsize="15px">{success.message}</SuccessMessage>
        )}

        <LoginInput
          theme={{roundness: 10}}
          mode="outlined"
          returnKeyType="done"
          onChangeText={n => setEmail(p => ({...p, value: n.trim()}))}
          value={email.value}
          placeholder="Email"
          keyboardType="email-address"
          right={
            email.value && (
              <LoginInput.Icon
                name="close-circle"
                color="#bbb"
                onPress={() => setEmail(p => ({...p, value: ''}))}
              />
            )
          }
          left={<LoginInput.Icon name="account-circle" color="#bbb" />}
        />
        {email.error && (
          <ErrorMessage fontsize="13px">Email-address required</ErrorMessage>
        )}
        {/* show password and confirm passowrd if only sign in and sign up */}
        {/* for password */}
        <Spacer size={'medium'} />
        <LoginInput
          secureTextEntry={showPassword}
          theme={{roundness: 10}}
          mode="outlined"
          returnKeyType="done"
          onChangeText={n => setPassword(p => ({...p, value: n.trim()}))}
          value={password.value}
          placeholder="Password"
          keyboardType="default"
          right={
            password.value && (
              <LoginInput.Icon
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                color="#bbb"
                onPress={() => setShowPassword(!showPassword)}
              />
            )
          }
          left={<LoginInput.Icon name="lock" color="#bbb" />}
        />

        {password.error && (
          <ErrorMessage fontsize="13px">Password required</ErrorMessage>
        )}

        <Spacer size={'large'} />
        <Button
          theme={{roundness: 10}}
          mode="contained"
          style={{height: 40}}
          color={theme.colors.brand.primary}
          onPress={onClickSubmit}>
          SIGN IN
        </Button>
      </AccountContainer>
    </SafeArea>
  );
};
