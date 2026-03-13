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
  const colors = theme?.theme?.colors || {
    black: '#ffffff',
    success: '#34c759',
    warning: '#ffb020',
    error: '#ef4444',
  };
  return StyleSheet.create({
    container: {
      padding: 15,
      margin: 10,
      borderRadius: 5,
    },
    message: {
      color: colors.black,
      fontSize: 14,
    },
    success: {
      backgroundColor: colors.success,
    },
    warning: {
      backgroundColor: colors.warning,
    },
    error: {
      backgroundColor: colors.error,
    },
  });
};

export default UIAlert;
