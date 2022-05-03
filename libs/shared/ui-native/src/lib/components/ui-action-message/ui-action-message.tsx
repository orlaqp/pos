import { useSharedStyles } from '@pos/theme/native';
import { useTheme, Text, Button } from '@rneui/themed';
import React from 'react';

import { View, StyleSheet } from 'react-native';

/* eslint-disable-next-line */
export interface UiActionMessageProps {
  message: string;
  actionTitle: string;
  action: () => void;
}

export function UiActionMessage(props: UiActionMessageProps) {
  const styles = useStyles();

  return (
    <View style={[styles.centered]}>
      <Text style={styles.message}>{props.message}</Text>
      <Button style={styles.action} type="outline" title={props.actionTitle} onPress={props.action} />
    </View>
  );
}

const useStyles = () => {
  const theme = useTheme();
  const sharedStyles = useSharedStyles();
  return {
    ...sharedStyles,
    ...StyleSheet.create({
        message: {
            color: theme.theme.colors.black,
            fontSize: 18,
            margin: 20,
            textAlign: 'center'
        },
        action: {
            marginTop: 20
        }
    }),
  };
};

export default UiActionMessage;
