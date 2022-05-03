import { useTheme, Text } from '@rneui/themed';
import React from 'react';

import { View, StyleSheet } from 'react-native';

/* eslint-disable-next-line */
export interface UIAlertProps {
  message: string;
  type: 'success' | 'warning' | 'error';
}

export function UIAlert(props: UIAlertProps) {
  const styles = useStyles();
  return (
    <View style={[styles.container, styles[props.type]]}>
      <Text style={styles.message}>{props.message}</Text>
    </View>
  );
}

const useStyles = () => {
  const theme = useTheme();
  return StyleSheet.create({
    container: {
      padding: 15,
      margin: 10,
      borderRadius: 5,
    },
    message: {
      color: theme.theme.colors.black,
      fontSize: 14,
    },
    success: {
      backgroundColor: theme.theme.colors.success,
    },
    warning: {
      backgroundColor: theme.theme.colors.warning,
    },
    error: {
      backgroundColor: theme.theme.colors.error,
    },
  });
};

export default UIAlert;
