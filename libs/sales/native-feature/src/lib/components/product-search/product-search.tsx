import { UISearchInput } from '@pos/shared/ui-native';
import React from 'react';

import { View } from 'react-native';

/* eslint-disable-next-line */
export interface ProductSearchProps {
    onFilterChange: (text: string) => void; 
}

export function ProductSearch({ onFilterChange }: ProductSearchProps) {
    return (
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
    );
}

export default ProductSearch;
