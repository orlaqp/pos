import React from 'react';

import { ProductEntity } from '@pos/products/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { View, Text } from 'react-native';

export interface SearchItemProps {
    product: ProductEntity;
    onAdd: (product: ProductEntity) => void;
}

export function CompactProductItem({ product, onAdd }: SearchItemProps) {
    const styles = useSharedStyles();

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
                <Text style={styles.name}>{product.quantity.toFixed(2)}</Text>
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
                    onPress={() => onAdd(product)}
                />
            </View>
        </View>
    );
}

export default CompactProductItem;
