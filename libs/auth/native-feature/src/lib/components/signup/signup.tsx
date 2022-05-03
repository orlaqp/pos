import React, { useState } from 'react';

import { View, StyleSheet, Image } from 'react-native';
import { useTheme, Button, Input, Card, Text } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Auth } from 'aws-amplify';
import { useForm, FormProvider } from 'react-hook-form';
import { UiActionMessage, UIAlert, UIInput } from '@pos/shared/ui-native';

import logo from '../../assets/logo.png';
export interface SignupProps {
  navigation: NativeStackNavigationProp<any>;
}

type SignUpModel = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignUpScreen(props: SignupProps) {
  const styles = useStyles();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(true);

  const formMethods = useForm<SignUpModel>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(model: SignUpModel) {
    console.log('form submitted', model);
    setError(null);

    try {
      const res = await Auth.signUp({
        username: model.email,
        password: model.password,
        attributes: {
          name: model.name,
        },
      });
      setSuccess(true);
      console.log('singup result', res);
    } catch (e: any) {
      console.error(e.message);
      setSuccess(false);
      setError(e.message);
    }
  }

  //   debugger;
  return (
    <FormProvider {...formMethods}>
      <View style={[styles.container, styles.centered]}>
        <View style={{ width: '40%' }}>
          <View style={[styles.centered, styles.bottomMargin]}>
            <Image source={logo} style={styles.logo} />
          </View>
          {error && <UIAlert message={error} type="error" />}
          {success && 
            <UiActionMessage
                message='Congratulation! Your account was successfully created. Please click the button below to login with your credentials'
                actionTitle='Login'
                action={() => alert()}
            />
          }
          {!success && (
            <>
              <UIInput
                name="name"
                placeholder="Name"
                style={styles.topMargin}
              />
              <UIInput
                name="email"
                placeholder="Username"
                style={styles.topMargin}
              />
              <UIInput
                name="password"
                placeholder="Password"
                style={styles.topMargin}
                secureTextEntry={true}
              />
              <UIInput
                name="confirmPassword"
                placeholder="Confirm Password"
                style={styles.topMargin}
                secureTextEntry={true}
              />
              <Button
                title="Create Account"
                containerStyle={styles.topMargin}
                raised={false}
                type="outline"
                onPress={formMethods.handleSubmit(onSubmit)}
              />
            </>
          )}
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

export default SignUpScreen;
