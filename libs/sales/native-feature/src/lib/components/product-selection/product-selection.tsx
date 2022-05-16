import { categoriesActions, CategoryEntity } from '@pos/categories/data-access';
import {
    ProductEntity,
    productsActions,
    selectFilteredList,
    selectProductsByCategory,
} from '@pos/products/data-access';
import { cartActions } from '@pos/sales/data-access';
import { ButtonItemType, UIButton, UIEmptyState, UISearchInput } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import React, { useState } from 'react';

import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    category?: CategoryEntity;
}

export function ProductSelection(props: ProductSelectionProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const products = useSelector(selectProductsByCategory(props.category?.id));
    const filteredProducts = useSelector(selectFilteredList);


    const onFilterChange = (text: string) => {
        dispatch(categoriesActions.select({ name: 'All Prods' }));
        dispatch(productsActions.filter(text));
    };

    const onSelected = (p: ButtonItemType) => {
        dispatch(cartActions.select({ product: p as ProductEntity, quantity: 0 }));
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
                <View style={{ width: '50%', marginTop: 20 }}>
                    <UISearchInput onChange={onFilterChange} />
                </View>
            </View>

            {!products.length &&
                <View style={{ flex: 1, marginTop: 300 }}>
                <UIEmptyState text='No products found for this category' backgroundColor='transparent' />
            </View>
            }

            <View style={{ padding: 25 }}>
                <ScrollView>
                    <View style={[styles.row, { alignContent: 'space-around', justifyContent: 'center' }]}>
                        {products?.map((p) => (
                            <View
                                style={{
                                    borderRadius: 5,
                                    borderColor: theme.theme.colors.grey4,
                                    backgroundColor: theme.theme.colors.grey4,
                                    borderWidth: 1,
                                    marginRight: 10,
                                }}
                            >
                                <UIButton
                                    item={p}
                                    onSelected={(item) => onSelected(item)}
                                    maxTextLength={14}
                                >
                                    <View
                                        style={{
                                            marginTop: 4,
                                            padding: 4,
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.labelText,
                                                {
                                                    fontWeight: 'bold',
                                                    fontSize: 18,
                                                },
                                            ]}
                                        >
                                            $ {p.price.toFixed(2)}
                                        </Text>
                                    </View>
                                </UIButton>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

export default ProductSelection;
