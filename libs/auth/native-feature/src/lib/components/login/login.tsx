import React from 'react';

import { View, StyleSheet, Image } from 'react-native';
import { useTheme, Button, Input, Card, Text } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import logo from '../assets/logo.png';
import { Link } from '@react-navigation/native';

/* eslint-disable-next-line */
export interface LoginProps {
    navigation: NativeStackNavigationProp<any>;
}

export function LoginScreen(props: LoginProps) {
  const styles = useStyles();
  const gotoHome = () => props.navigation.replace('Home');

//   debugger;
  return (
    <View style={[styles.container, styles.centered]}>
      <View style={{ width: '40%' }}>
        <View style={[styles.centered, styles.bottomMargin]}>
            <Image source={logo} style={styles.logo} />
        </View>
        <Input placeholder="Username" style={styles.topMargin} />
        <Input placeholder="Password" style={styles.topMargin} secureTextEntry={true} />
        <Button title="Login" type='outline' containerStyle={styles.topMargin} onPress={gotoHome} />
        <Text style={styles.signUpText}>Or if you do not have an account yet please click: <Link style={styles.signUpLink} to={{ screen: 'Signup' }}>HERE</Link></Text>
        
      </View>
    </View>
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
        marginTop: 20
    },
    logo: {
        width: 150,
        height: 150
    }
  });
};

export default LoginScreen;
