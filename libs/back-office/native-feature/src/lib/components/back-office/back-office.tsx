import React from 'react';
import { useSharedStyles } from '@pos/theme/native';

import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../sidebar/sidebar';
import { ScrollView } from 'react-native-gesture-handler';
import { Avatar, Divider } from '@rneui/themed';

import Logo from '../../assets/logo.png';

/* eslint-disable-next-line */
export interface BackOfficeProps {}

export function BackOffice(props: BackOfficeProps) {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.page}>
      <View style={[styles.page, styles.row]}>
        <View style={styles.leftSide}>
          <ScrollView>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Image source={Logo} style={styles.logo} />
              <Text style={{ color: 'white' }}>Orlando Quero</Text>
            </View>
            <Divider color='#444' style={{ marginBottom: 20 }} />
            <View style={{ marginLeft: 10 }}>
                <Sidebar />
            </View>
          </ScrollView>
        </View>
        <View style={styles.rightSide}>
          
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
        flexDirection: 'column',
      },
      rightSide: {
        ...sharedStyles.darkerGrayBackground,
        ...sharedStyles.rounded,
        flex: 10,
        marginLeft: 20,
        height: '100%',
      },
      logo: {
          width: 100,
          height: 100,
      }
    }),
  };
};

export default BackOffice;
