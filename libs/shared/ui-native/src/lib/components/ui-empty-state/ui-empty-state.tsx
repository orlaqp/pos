import { theme, useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, StyleSheet, Image } from 'react-native';

import EmptyBox from '../../assets/empty-box.png';

/* eslint-disable-next-line */
export interface EmptyStateProps {
  imageSize?: number;
  text: string;
  actionText: string;
  action: () => unknown;
}

export function UIEmptyState({
  imageSize,
  text,
  actionText,
  action,
}: EmptyStateProps) {
  const theme = useTheme();
  const styles = useStyles();
  const size = imageSize || 200;

  return (
    <View style={[styles.page, styles.centered]}>
      <View style={[styles.centered, { width: '60%', marginTop: -100 }]}>
        <Image source={EmptyBox} style={{ width: size, height: size }} />
        <Text style={styles.text}>{text}</Text>
        <Button
            type="outline"
            title={actionText}
            onPress={action}
            buttonStyle={{ paddingRight: 20 }}
            titleStyle={{ fontSize: 14 }}
            icon={{ name: 'plus', type: "material-community", color: theme.theme.colors.primary }}
        />
      </View>
    </View>
  );
}

const useStyles = () => {
  const theme = useTheme();
  const sharedStyles = useSharedStyles();

  return {
    ...sharedStyles,
    ...StyleSheet.create({
      image: {
        width: 75,
        height: 75,
      },
      text: {
        color: theme.theme.colors.grey3,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 25
      },
    }),
  };
};

export default UIEmptyState;
