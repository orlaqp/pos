
import React from 'react';

import { View, StyleSheet, Image } from 'react-native';
import { useTheme, Button, Text, Input } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Link } from '@react-navigation/native';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { UIInput, UIAlert } from '@pos/shared/ui-native';
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
      email: '',
      password: '',
    },
  });

  const login = async (model: SignInModel) => {
    dispatch(signIn({ email: model.email, password: model.password}));
  };

  //   debugger;
  return (
    <FormProvider {...formMethods}>
      <View style={[styles.container, styles.centered]}>
        <View style={{ width: '40%' }}>
          <View style={[styles.centered, styles.bottomMargin]}>
            <Image source={logo} style={styles.logo} />
          </View>
          {error && <UIAlert message={error} type="error" />}

          <UIInput
            name='email'
            placeholder='Email address'
            keyboardType='email-address'
            style={styles.topMargin}
            rules={{ required: 'Email address is required'}}
          />
          <UIInput
            name="password"
            placeholder="Password"
            style={styles.topMargin}
            secureTextEntry={true}
            rules={{ required: 'Password is required' }}
          />
          
          <Button
            title="Login"
            type="outline"
            containerStyle={styles.topMargin}
            onPress={formMethods.handleSubmit(login)}
            loading={loading}
          />
          <Text style={styles.signUpText}>
            Or if you do not have an account yet please click{' '}
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
