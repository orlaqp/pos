import { useSharedStyles } from '@pos/theme/native';
import { useTheme, Text, Button } from '@rneui/themed';
import React from 'react';

import { View, StyleSheet } from 'react-native';

/* eslint-disable-next-line */
export interface TotalsProps {}

export function Totals(props: TotalsProps) {
    const styles = useStyles();
  return (
    <View style={styles.totalsContainer}>
      <View style={styles.items}>
          <Text>Product items</Text>
      </View>
      <View style={styles.subtotal}>
          <Text>Subtotal</Text>
          <Text>Taxes</Text>
      </View>
      <View style={styles.submit}>
          <Button type='solid' raised title={'$ 10.25'} />
      </View>
    </View>
  );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return StyleSheet.create({
        totalsContainer: {
            ...sharedStyles.page,
            flexDirection: 'column',
            borderRadius: 5,
            padding: 15,
            backgroundColor: `${theme.theme.colors.searchBg}55`
        },
        items: {
            flex: 10
        },
        subtotal: {
            flex: 2
        },
        submit: {
            flex: 1
        },
    });
}


export default Totals;
