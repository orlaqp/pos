import React from 'react';
import { useSharedStyles } from '@pos/theme/native';

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../sidebar/sidebar';

/* eslint-disable-next-line */
export interface BackOfficeProps {}

export function BackOffice(props: BackOfficeProps) {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.page}>
      <View style={[styles.page, styles.row]}>
        <View style={styles.leftSide}>
          <Sidebar />
        </View>
        <View style={styles.rightSide}>
          <Text style={{ color: 'yellow' }}>Right side</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const useStyles = () => {
  const sharedStyles = useSharedStyles();

  return {
    ...sharedStyles,
    ...StyleSheet.create({
      leftSide: {
        flex: 3,
      },
      rightSide: {
          ...sharedStyles.darkerGrayBackground,
          ...sharedStyles.rounded,
        flex: 9,
        marginLeft: 20,
        height: '100%'
      },
    }),
  };
};

export default BackOffice;
