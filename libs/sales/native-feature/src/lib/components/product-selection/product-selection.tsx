import { ProductEntity } from '@pos/products/data-access';
import { cartActions } from '@pos/sales/data-access';
import { ButtonItemType, UIButton, UIEmptyState } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Dictionary } from '@reduxjs/toolkit';
import { useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    products: ProductEntity[];
    onSelected: (p: ButtonItemType) => void;
}

export function ProductSelection({ products, onSelected }: ProductSelectionProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    
    return (
        <View>
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
                                key={p.id}
                                style={{
                                    ...styles.itemBackground,
                                    borderRadius: 5,
                                    marginRight: 10,
                                    marginBottom: 10,
                                }}
                            >
                                <UIButton
                                    item={p}
                                    onSelected={onSelected}
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
