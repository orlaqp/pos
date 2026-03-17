import React from 'react';
import { getThemeColors, useSharedStyles } from '@pos/theme/native';
import { useTheme, Text } from '@rneui/themed';

import { View, StyleSheet, ActivityIndicator } from 'react-native';

export interface UISpinnerProps {
    size?: 'large' | 'small';
    message?: string;
}

export function UISpinner({ size, message }: UISpinnerProps) {
  const styles = useStyles();
  const spinnerSize = size || 'small';
  const label = message || 'Loading';

  return (
    <View style={[styles.centered]}>
      <View style={styles.panel}>
        <ActivityIndicator size={spinnerSize} color={styles.indicatorColor.color} />
        <View style={styles.copy}>
          <Text style={styles.text}>{label}</Text>
          <Text style={styles.subtext}>Fetching the latest data</Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const sharedStyles = useSharedStyles();

  return {
    ...sharedStyles,
    ...StyleSheet.create({
      panel: {
        minWidth: 220,
        maxWidth: 320,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
      copy: {
        marginTop: 12,
        alignItems: 'center',
      },
      indicatorColor: {
        color: '#56A8FF',
      },
      text: {
        color: '#F3F6FB',
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 20,
        textAlign: 'center',
      },
      subtext: {
        color: '#A6B1C2',
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
      },
    }),
  };
};

export default UISpinner;
