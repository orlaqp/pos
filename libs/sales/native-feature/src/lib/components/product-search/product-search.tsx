import { UISearchInput } from '@pos/shared/ui-native';
import React, { useState } from 'react';

import { Keyboard, TextInput, View } from 'react-native';
import { Button, useTheme } from '@rneui/themed';

/* eslint-disable-next-line */
export interface ProductSearchProps {
    filter?: string;
    onFilterChange: (text: string) => Promise<string>;
}

// export function ProductSearch({ filter, onFilterChange }: ProductSearchProps) {

export const ProductSearch = React.forwardRef<TextInput, ProductSearchProps>((props, ref) => {
    const { filter, onFilterChange } = props;
    const theme = useTheme();
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
                        ref={ref}
                        autoFocus={true}
                        clearTextOnFocus={true}
                        debounceTime={300}
                        placeholder="type to search by name, description, barcode and sku..."
                        returnKeyType='search'
                        autoComplete='off'
                        autoCorrect={false}
                        autoCapitalize='none'
                        onSubmit={onFilterChange}
                    />
                {/* <UISearchInput
                    ref={ref}
                    value={filter}
                    placeholder="type to search by name, description, barcode and sku..."
                    debounceTime={100}
                    showSoftInputOnFocus={showSoftInputOnFocus}
                    returnKeyType='search'
                    autoComplete='off'
                    autoCorrect={false}
                    autoCapitalize='none'
                    onSubmit={onFilterChange}
                /> */}
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
