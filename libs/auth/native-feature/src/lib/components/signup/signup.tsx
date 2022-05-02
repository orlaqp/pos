import React from 'react';

import { View, StyleSheet, Image } from 'react-native';
import { useTheme, Button, Input, Card, Text } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import logo from '../../assets/logo.png';

/* eslint-disable-next-line */
export interface SignupProps {
    navigation: NativeStackNavigationProp<any>;
}

export function SignUpScreen(props: SignupProps) {
  const styles = useStyles();
  const createAccount = () => props.navigation.replace('Home');

//   debugger;
  return (
    <View style={[styles.container, styles.centered]}>
      <View style={{ width: '40%' }}>
        <View style={[styles.centered, styles.bottomMargin]}>
            <Image source={logo} style={styles.logo} />
        </View>
        <Input placeholder="Username" style={styles.topMargin} />
        <Input placeholder="Password" style={styles.topMargin} secureTextEntry={true} />
        <Input placeholder="Confirm Password" style={styles.topMargin} secureTextEntry={true} />
        <Button title="Create Account" containerStyle={styles.topMargin} raised={true} onPress={createAccount} />
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

export default SignUpScreen;
