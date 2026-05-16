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
    <View style={[styles.container, styles[`${props.type}Container`]]}>
      <Text style={[styles.message, styles[`${props.type}Message`]]}>{props.message}</Text>
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
      borderRadius: 16,
      borderWidth: 1,
    },
    message: {
      fontSize: 14,
      lineHeight: 21,
    },
    successContainer: {
      backgroundColor: 'rgba(52, 199, 89, 0.18)',
      borderColor: 'rgba(52, 199, 89, 0.34)',
    },
    successMessage: {
      color: '#d8ffe3',
    },
    warningContainer: {
      backgroundColor: 'rgba(255, 176, 32, 0.12)',
      borderColor: 'rgba(255, 176, 32, 0.26)',
    },
    warningMessage: {
      color: '#f4d98b',
    },
    errorContainer: {
      backgroundColor: 'rgba(239, 68, 68, 0.16)',
      borderColor: 'rgba(239, 68, 68, 0.32)',
    },
    errorMessage: {
      color: '#ffd7d7',
    },
  });
};

export default UIAlert;
