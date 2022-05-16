import { UISearchInput } from '@pos/shared/ui-native';
import React, { useCallback, useState } from 'react';

import { View } from 'react-native';
import debounce from 'lodash/debounce';
import { Button, useTheme } from '@rneui/themed';

/* eslint-disable-next-line */
export interface ProductSearchProps {
    filter?: string;
    onFilterChange: (text: string) => void;
}

export function ProductSearch({ filter, onFilterChange }: ProductSearchProps) {
    const theme = useTheme();
    const [showSoftInputOnFocus, setShowSoftInputOnFocus] = useState(false);
    const debouncedOnChange = useCallback(debounce(onFilterChange, 300), []);

    const toggleSoftInput = () => setShowSoftInputOnFocus(!showSoftInputOnFocus);

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    width: '70%',
                    marginTop: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <UISearchInput
                    placeholder="type to search by name, description, barcode and sku..."
                    onChangeText={debouncedOnChange}
                    value={filter}
                    showSoftInputOnFocus={showSoftInputOnFocus}
                />
                <Button
                    icon={{
                        name: 'keyboard-outline',
                        type: 'material-community',
                        color: showSoftInputOnFocus ? theme.theme.colors.primary : theme.theme.colors.grey1
                    }}
                    type="clear"
                    onPress={toggleSoftInput}
                />
            </View>
        </View>
    );
}

export default ProductSearch;
