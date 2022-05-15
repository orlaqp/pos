import { CategoryEntity } from '@pos/categories/data-access';
import React from 'react';

import { View, Text } from 'react-native';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    category?: CategoryEntity;
}

export function ProductSelection(props: ProductSelectionProps) {
    return (
        <View>
            <Text style={{color: 'white'}}>
                {props.category?.name}
            </Text>
        </View>
    );
}

export default ProductSelection;
