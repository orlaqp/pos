import { ProductEntity } from '@pos/products/data-access';
import { cartActions } from '@pos/sales/data-access';
import { ButtonItemType, UIButton, UIEmptyState } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Dictionary } from '@reduxjs/toolkit';
import { useTheme } from '@rneui/themed';
import { iteratorSymbol } from 'immer/dist/internal';
import React, { useEffect, useState } from 'react';

import { View, Text, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    products: ProductEntity[];
    onSelected: (p: ButtonItemType) => void;
}

export function ProductSelection({
    products,
    onSelected,
}: ProductSelectionProps) {
    const styles = useSharedStyles();
    const [rows, setRows] = useState<ProductEntity[][]>();
    const [rowsToShow, setRowsToShow] = useState<number>(6);

    useEffect(() => {
        const chunkSize = 3;
        const rows = [];

        for (let i = 0; i < products.length; i += chunkSize) {
            const chunk = products.slice(i, i + chunkSize);
            rows.push(chunk);
            // do whatever
        }

        setRows(rows);
    }, [products]);

    return (
        <View>
            {!products.length && (
                <View style={{ marginTop: 100 }}>
                    <UIEmptyState
                        text="Select a category from the left or search for a product on top"
                        backgroundColor="transparent"
                    />
                </View>
            )}

            <View style={{ padding: 25 }}>
                <FlatList
                    data={rows?.slice(0, rowsToShow)}
                    // onEndReachedThreshold={0.2}
                    onEndReached={() => setRowsToShow(rowsToShow + 6)}
                    renderItem={(info) => (
                        <View
                            style={[
                                styles.row,
                                {
                                    alignContent: 'space-around',
                                    justifyContent: 'center',
                                },
                            ]}
                        >
                            {info.item?.map((p) => (
                                <View
                                    key={p.id}
                                    style={{
                                        ...styles.itemBackground,
                                        borderRadius: 5,
                                        marginRight: 10,
                                        marginBottom: 10,
                                        width: 180
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
                    )}
                />
                {/* <ScrollView>
                    
                </ScrollView> */}
            </View>
        </View>
    );
}

export default ProductSelection;
