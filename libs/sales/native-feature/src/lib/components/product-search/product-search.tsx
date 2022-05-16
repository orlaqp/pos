import { UISearchInput } from '@pos/shared/ui-native';
import React, { useCallback } from 'react';

import { View } from 'react-native';
import debounce from 'lodash/debounce';

/* eslint-disable-next-line */
export interface ProductSearchProps {
    filter?: string;
    onFilterChange: (text: string) => void; 
}

export function ProductSearch({ filter, onFilterChange }: ProductSearchProps) {

    const debouncedOnChange = useCallback(
        debounce(onFilterChange, 300)
    , []); 
        

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View style={{ width: '50%', marginTop: 20 }}>
                <UISearchInput onChange={debouncedOnChange} value={filter} />
            </View>
        </View>
    );
}

export default ProductSearch;
