import React from 'react';

import { View, StyleSheet, Image } from 'react-native';
import { useTheme, Button, Input, Card, Text } from '@rneui/themed';
import logo from './logo.png';

/* eslint-disable-next-line */
export interface LoginProps {}

export function LoginScreen(props: LoginProps) {
  const styles = useStyles();
  
//   debugger;
  return (
    <View style={[styles.container, styles.centered]}>
      <View style={{ width: '40%' }}>
        <View style={[styles.centered, styles.bottomMargin]}>
            <Image source={logo} style={styles.logo} />
        </View>
        <Input placeholder="Username" style={styles.topMargin} />
        <Input placeholder="Password" style={styles.topMargin} secureTextEntry={true} />
        <Button title="Login" containerStyle={styles.topMargin} raised={true} />
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
        width: 100,
        height: 100
    }
  });
};

export default LoginScreen;
