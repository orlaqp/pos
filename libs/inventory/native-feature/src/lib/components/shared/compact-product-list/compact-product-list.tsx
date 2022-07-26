import { ProductEntity } from '@pos/products/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { Dialog } from '@rneui/themed';
import React, { useState } from 'react';

import { View, Text, FlatList } from 'react-native';
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
    
    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            overlayStyle={[styles.overlay, { width: 700 }]}
        >
            <View>
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.secondaryText}>Products found: </Text>
                </View>
                <FlatList
                    data={products}
                    renderItem={({ item }) => (
                        <CompactProductItem
                            product={item}
                            onAdd={onAdd}
                        />
                    )}
                />
            </View>
        </Dialog>
    );
}

export default CompactProductList;
