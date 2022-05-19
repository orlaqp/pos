import { UISearchInput } from '@pos/shared/ui-native';
import React, { useCallback, useState } from 'react';

import { TextInputKeyPressEventData, View } from 'react-native';
import debounce from 'lodash/debounce';
import { Button, useTheme } from '@rneui/themed';
import { NativeSyntheticEvent } from 'react-native';

/* eslint-disable-next-line */
export interface ProductSearchProps {
    filter?: string;
    onFilterChange: (text: string) => void;
}

export function ProductSearch({ filter, onFilterChange }: ProductSearchProps) {
    const theme = useTheme();
    // const [text, setText] = useState<string>();
    const [showSoftInputOnFocus, setShowSoftInputOnFocus] = useState(false);
    
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
                    // value={text}
                    debounceTime={300}
                    showSoftInputOnFocus={showSoftInputOnFocus}
                    returnKeyType='search'
                    autoComplete='off'
                    autoCorrect={false}
                    autoCapitalize='none'
                    onTextChanged={onFilterChange}
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