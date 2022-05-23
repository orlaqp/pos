import { UISearchInput } from '@pos/shared/ui-native';
import React, { useState } from 'react';

import { TextInput, View } from 'react-native';
import { Button, useTheme } from '@rneui/themed';

/* eslint-disable-next-line */
export interface ProductSearchProps {
    filter?: string;
    onFilterChange: (text: string) => void;
}

// export function ProductSearch({ filter, onFilterChange }: ProductSearchProps) {

export const ProductSearch = React.forwardRef<TextInput, ProductSearchProps>((props, ref) => {
    const { filter, onFilterChange } = props;
    const theme = useTheme();
    const [showSoftInputOnFocus, setShowSoftInputOnFocus] = useState(false);

    console.log('====================================');
    console.log('filter:', filter);
    console.log('====================================');
    
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
                    ref={ref}
                    placeholder="type to search by name, description, barcode and sku..."
                    // value={text}
                    debounceTime={300}
                    showSoftInputOnFocus={showSoftInputOnFocus}
                    returnKeyType='search'
                    autoComplete='off'
                    autoCorrect={false}
                    autoCapitalize='none'
                    onTextChanged={onFilterChange}
                    value={filter}
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
});
