import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';

import { View, StyleSheet } from 'react-native';
import { CategorySelection } from '@pos/categories/native-feature';
import { ProductSelection } from '@pos/products/native-feature';
import Totals from '../../components/totals/totals';

import { Storage } from 'aws-amplify';

/* eslint-disable-next-line */
export interface SalesScreenProps {}

export function SalesScreen(props: SalesScreenProps) {
    const styles = useStyles();

    const result = Storage.put('beverage-category', fetch())

  return (
    <View style={[styles.page, styles.row]}>
        <View style={styles.leftColumn}>
            <View style={styles.categories}>
                <CategorySelection />
            </View>
            <View style={styles.products}>
                <ProductSelection />
            </View>
        </View>
        <View style={styles.rightColumn}>
            <Totals />
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
            leftColumn: {
                ...sharedStyles.column,
                flex: 9,
            },
            rightColumn: {
                flex: 3
            },
            categories: {
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 10,
            },
            products: {
                flex: 3
            },
           
        })
    }
} 

export default SalesScreen;
