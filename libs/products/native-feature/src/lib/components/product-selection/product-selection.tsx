import { CategoryEntity } from '@pos/categories/data-access';
import {
    ProductEntity,
    selectAllProducts,
    selectProductsByCategory,
} from '@pos/products/data-access';
import {
    ButtonItemType,
    UIButton,
    UIS3Image,
    UISearchInput,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    category?: CategoryEntity;
}

export function ProductSelection(props: ProductSelectionProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const products = useSelector(selectProductsByCategory(props.category?.id));

    const onFilterChange = (text: string) => {
        console.log('filter changes');
    };

    const onSelected = (p: ButtonItemType) => {
        console.log('Product selected');
    };

    return (
        <View>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View style={{ width: '50%' }}>
                    <UISearchInput onChange={onFilterChange} />
                </View>
            </View>

            <View style={{ padding: 25 }}>
                <ScrollView>
                    <View style={styles.row}>
                        {products?.map((p) => (
                            <UIButton
                                item={p}
                                onSelected={(item) => onSelected(item)}
                                maxTextLength={10}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

export default ProductSelection;
