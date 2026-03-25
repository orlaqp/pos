import { ProductEntity } from '@pos/products/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { Button } from '@rneui/themed';
import React from 'react';

import { View, Text, FlatList, Pressable } from 'react-native';
import CompactProductItem from '../compact-product-item/compact-product-item';

/* eslint-disable-next-line */
export interface CompactProductListProps {
    visible: boolean;
    products: ProductEntity[];
    onAdd: (item: ProductEntity) => void;
    onClose: () => void;
}

export function CompactProductList({ products, onAdd, onClose, visible }: CompactProductListProps) {
    const styles = useSharedStyles();

    if (!visible) {
        return null;
    }
    
    return (
        <View
            pointerEvents="box-none"
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
            }}
        >
            <Pressable
                testID="compact-product-list-backdrop"
                onPress={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.55)',
                }}
            />
            <View
                style={[
                    styles.overlay,
                    {
                        width: 700,
                        maxHeight: '75%',
                    },
                ]}
            >
                <View
                    style={{
                        marginBottom: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Text style={styles.secondaryText}>Products found:</Text>
                    <Button
                        type="clear"
                        title="Close"
                        onPress={onClose}
                        testID="compact-product-list-close"
                    />
                </View>
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <CompactProductItem
                            product={item}
                            onAdd={onAdd}
                        />
                    )}
                />
            </View>
        </View>
    );
}

export default CompactProductList;
