import { ProductEntity } from '@pos/products/data-access';
import { cartActions } from '@pos/sales/data-access';
import { ButtonItemType, UIButton, UIEmptyState } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Dictionary } from '@reduxjs/toolkit';
import { useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    products?: Dictionary<ProductEntity>;
}

export function ProductSelection({ products }: ProductSelectionProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    
    const onSelected = (p: ButtonItemType) => {
        dispatch(cartActions.select({ product: p as ProductEntity, quantity: 1 }));
    };
    
    const productIds = Object.keys(products || {});

    return (
        <View>
            {!productIds.length &&
                <View style={{ flex: 1, marginTop: 300 }}>
                <UIEmptyState text='No products found for this category' backgroundColor='transparent' />
            </View>
            }

            <View style={{ padding: 25 }}>
                <ScrollView>
                    <View style={[styles.row, { alignContent: 'space-around', justifyContent: 'center' }]}>
                        {productIds?.map((id) => (
                            <View
                                key={id}
                                style={{
                                    borderRadius: 5,
                                    borderColor: theme.theme.colors.grey4,
                                    backgroundColor: theme.theme.colors.grey4,
                                    borderWidth: 1,
                                    marginRight: 10,
                                }}
                            >
                                <UIButton
                                    item={products[id]!}
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
                                            $ {products[id]!.price.toFixed(2)}
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
