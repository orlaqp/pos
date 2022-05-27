
import React from 'react';

import { View, StyleSheet, Image } from 'react-native';
import { useTheme, Button, Text, Input } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Link } from '@react-navigation/native';
import { FormProvider, useForm } from 'react-hook-form';
import { UIInput, UIAlert, UIVerticalSpacer } from '@pos/shared/ui-native';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '@pos/auth/data-access';
import { RootState } from '@pos/store';


import logo from '../assets/logo.png';

/* eslint-disable-next-line */
export interface LoginProps {
  navigation: NativeStackNavigationProp<any>;
}

type SignInModel = {
  email: string;
  password: string;
};

export function LoginScreen(props: LoginProps) {
  const styles = useStyles();
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state.auth.error);
  const loading = useSelector((state: RootState) => state.auth.signInStatus === 'inProgress');
  const formMethods = useForm<SignInModel>({
      mode: 'onChange',
    defaultValues: {
      email: 'orlaqp@gmail.com',
      password: '12345678',
    },
  });

  const login = async (model: SignInModel) => {
    dispatch(signIn({ email: model.email, password: model.password}));
  };

  return (
    <FormProvider {...formMethods}>
      <View style={[styles.container, styles.centered]}>
        <View style={{ width: '40%' }}>
          <View style={[styles.centered, styles.bottomMargin]}>
            <Image source={logo} style={styles.logo} />
          </View>
          <UIVerticalSpacer size='medium' />
          {error && <UIAlert message={error} type="error" />}

          <UIInput
            name='email'
            autoCapitalize='none'
            placeholder='Email address'
            keyboardType='email-address'
            textAlign='left'
            rules={{
                required: 'Email address is required',
                // eslint-disable-next-line no-useless-escape
                pattern: { 
                    value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: 'Email address is invalid'
                }
            }}
          />
          <UIInput
            name="password"
            placeholder="Password"
            secureTextEntry={true}
            textAlign='left'
            rules={{ required: 'Password is required' }}
          />
          
          <View style={{ paddingHorizontal: 100 }}>
          <Button
            title="Login"
            type="solid"
            containerStyle={styles.topMargin}
            onPress={formMethods.handleSubmit(login)}
            loading={loading}
          />
          </View>
          <Text style={styles.signUpText}>
            If you need a new account click{' '}
            <Link style={styles.signUpLink} to={{ screen: 'Signup' }}>
              HERE
            </Link>
          </Text>
        </View>
      </View>
    </FormProvider>
  );
}

const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.theme.colors.background,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signUpText: {
      textAlign: 'center',
      fontSize: 18,
      marginTop: 45,
    },
    signUpLink: {
      fontSize: 18,
      textAlign: 'center',
      color: theme.theme.colors.primary,
    },
    bottomMargin: {
      marginBottom: 50,
    },
    topMargin: {
      marginTop: 20,
    },
    logo: {
      width: 150,
      height: 150,
    },
  });
};

export default LoginScreen;
