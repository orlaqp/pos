import React, { useCallback, useState } from 'react';

import { Input, useTheme } from '@rneui/themed';
import { TextInput } from 'react-native';
// import debounce from 'lodash/debounce';
type UiSearchInputProps = React.ComponentProps<typeof TextInput> & {
    onSubmit: (text: string) => void;
    onClear?: () => void;
    debounceTime?: number;
};

export const UISearchInput = React.forwardRef<TextInput, UiSearchInputProps>(
    (props, ref) => {
        const theme = useTheme();
        const { value, onChange, debounceTime, onSubmit, onClear, ...restOfProps } =
            props;
        const [text, setText] = useState<string | undefined>(value);

        // const debouncedOnChange = useCallback(
        //     debounce(async (text) => {
        //         if (!onTextChanged) return;
                
        //         const res = await onTextChanged(text);
        //         console.log('On change text response: ', res);
                
        //         setText(res);
        //     }, debounceTime || 0),
        //     []
        // );

        const clearText = () => {
            setText('');
            if (onSubmit) onSubmit('');
            if (onClear) onClear();
        }

        return (
            <Input
                ref={ref}
                {...restOfProps}
                // value={text}
                autoComplete='off'
                autoCapitalize='none'
                autoFocus={true}
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
                // onChangeText={(text) => { setText(text); debouncedOnChange(text) }}
                onSubmitEditing={(e) => onSubmit(e.nativeEvent.text)}
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
