import React from 'react';

import { ProductEntity } from '@pos/products/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { Button } from '@rneui/themed';
import { View, Text } from 'react-native';

export interface SearchItemProps {
    product: ProductEntity;
    onAdd: (product: ProductEntity) => void;
}

const toTestKey = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const formatQuantity = (value: unknown) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '0.00';
    }

    return value.toFixed(2);
};

export function CompactProductItem({ product, onAdd }: SearchItemProps) {
    const styles = useSharedStyles();
    const productKey = toTestKey(product.name);

    return (
        <View style={[styles.miniDataRow]}>
            <View style={{ flex: 2 }}>
                <Text style={styles.primaryText}>
                    {product.name} ({product.unitOfMeasure})
                </Text>
                <Text style={styles.secondaryText}>
                    {product.description}
                </Text>
            </View>
        
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{formatQuantity(product.quantity)}</Text>
            </View>

            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Button
                    type="clear"
                    title="Add to list"
                    testID={`compact-product-add-${productKey}`}
                    onPress={() => onAdd(product)}
                />
            </View>
        </View>
    );
}

export default CompactProductItem;
