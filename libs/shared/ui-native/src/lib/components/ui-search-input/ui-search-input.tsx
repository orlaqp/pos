import React, { useCallback, useState } from 'react';

import { Input, useTheme } from '@rneui/themed';
import { TextInput } from 'react-native';
import debounce from 'lodash/debounce';
type UiSearchInputProps = React.ComponentProps<typeof TextInput> & {
    onTextChanged?: (text: string) => void;
    debounceTime?: number;
};

export const UISearchInput = React.forwardRef<TextInput, UiSearchInputProps>(
    (props, ref) => {
        const theme = useTheme();
        const { value, onChange, debounceTime, onTextChanged, ...restOfProps } =
            props;
        const [text, setText] = useState<string | undefined>(value);

        const debouncedOnChange = useCallback(
            debounce((text) => {
                if (!onTextChanged) return;
                onTextChanged(text);
            }, debounceTime || 0),
            []
        );

        const clearText = () => {
            if (!text || !onTextChanged) return;

            setText('');
            onTextChanged('');
        }

        return (
            <Input
                {...restOfProps}
                value={text}
                containerStyle={{
                    backgroundColor: theme.theme.colors.grey5,
                    borderRadius: 20,
                }}
                inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 10 }}
                inputStyle={{ color: theme.theme.colors.grey1 }}
                rightIcon={{
                    name: text ? 'close-circle-outline' : 'magnify',
                    type: 'material-community',
                    color: theme.theme.colors.grey2,
                    onPress: clearText,
                }}
                renderErrorMessage={false}
                onChangeText={(text) => {
                    setText(text);
                    debouncedOnChange(text);
                }}
                onSubmitEditing={() => setTimeout(() => setText(''), (debounceTime || 0) + 100)}
            />
        );
    }
);

// export function UISearchInput2({ onChange, value }: UiSearchInputProps) {
//     const theme = useTheme();
//   return (
//     <Input
//       placeholder="type to search ..."
//       showSoftInputOnFocus={false}
//       value={value}
//       onChangeText={onChange}
//       containerStyle={{
//         backgroundColor: theme.theme.colors.grey5,
//         borderRadius: 20,
//       }}
//       inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 10 }}
//       inputStyle={{ color: theme.theme.colors.grey1 }}
//       rightIcon={{
//         name: 'magnify',
//         type: 'material-community',
//         color: theme.theme.colors.grey2,
//       }}
//       renderErrorMessage={false}
//     />
//   );
// }

// export default UISearchInput;
