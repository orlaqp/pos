import React from 'react';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme, Text } from '@rneui/themed';

import { View, StyleSheet, ActivityIndicator } from 'react-native';

export interface UISpinnerProps {
    size?: 'large' | 'small';
    message?: string;
}

export function UISpinner({ size, message }: UISpinnerProps) {
  const styles = useStyles();
  const spinnerSize = size || 'small';

  return (
    <View style={[styles.centered]}>
      <ActivityIndicator size={spinnerSize} />
      { message && <Text style={styles.text}>{message}</Text> }
    </View>
  );
}

const useStyles = () => {
  const theme = useTheme();
  const sharedStyles = useSharedStyles();

  return {
    ...sharedStyles,
    ...StyleSheet.create({
      text: {
        color: theme.theme.colors.grey3,
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20
      },
    }),
  };
};

export default UISpinner;
