import { UISearchInput } from '@pos/shared/ui-native';
import React, { useCallback, useMemo, useState } from 'react';

import { TextInput, View } from 'react-native';
import { Button, useTheme } from '@rneui/themed';

/* eslint-disable-next-line */
export interface ProductSearchProps {
    filter?: string;
    onFilterChange: (text: string) => Promise<string>;
}

// export function ProductSearch({ filter, onFilterChange }: ProductSearchProps) {

export const ProductSearch = React.forwardRef<TextInput, ProductSearchProps>((props, ref) => {
    const { onFilterChange } = props;
    const theme = useTheme();
    const [showSoftInputOnFocus, setShowSoftInputOnFocus] = useState(false);

    const searchRef = useMemo(() => {
        if (typeof ref === 'function') {
            return {
                current: null as TextInput | null,
            };
        }

        return ref ?? { current: null as TextInput | null };
    }, [ref]);

    const setCombinedRef = useCallback(
        (node: TextInput | null) => {
            searchRef.current = node;
            if (typeof ref === 'function') {
                ref(node);
                return;
            }

            if (ref) {
                ref.current = node;
            }
        },
        [ref, searchRef]
    );

    const toggleSoftInput = () => {
        setShowSoftInputOnFocus((current) => !current);
        searchRef.current?.focus?.();
    };

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
                <UISearchInput
                    testID="sales-product-search-input"
                    ref={setCombinedRef}
                    autoFocus={true}
                    clearTextOnFocus={true}
                    debounceTime={300}
                    placeholder="type to search by name, description, barcode and sku..."
                    returnKeyType='search'
                    autoComplete='off'
                    autoCorrect={false}
                    autoCapitalize='none'
                    blurOnSubmit={false}
                    clearOnSubmit={true}
                    retainFocusOnSubmit={true}
                    onSubmit={onFilterChange}
                />
            </View>
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
    );
});
