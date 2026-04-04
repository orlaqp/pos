import React, { useState } from 'react';

import { Input, useTheme } from '@rneui/themed';
import { TextInput } from 'react-native';
// import debounce from 'lodash/debounce';
type UiSearchInputProps = React.ComponentProps<typeof TextInput> & {
    onSubmit: (text: string) => void | Promise<unknown>;
    onClear?: () => void;
    debounceTime?: number;
};

export const UISearchInput = React.forwardRef<TextInput, UiSearchInputProps>(
    (props, ref) => {
        const theme = useTheme();
        const colors = theme?.theme?.colors || {
            grey5: '#2f3742',
            grey2: '#8f9baa',
            grey1: '#ffffff',
        };
        const {
            value,
            onChangeText,
            onSubmit,
            onClear,
            ...restOfProps
        } =
            props;
        const [text, setText] = useState<string>(typeof value === 'string' ? value : '');
        const currentText = typeof value === 'string' ? value : text;

        const handleChangeText = (nextText: string) => {
            setText(nextText);
            onChangeText?.(nextText);
        };

        const handleSubmit = (submittedText?: string) => {
            const nextText = submittedText ?? currentText;
            setText(nextText);
            void onSubmit(nextText);
        };

        const clearText = () => {
            setText('');
            onChangeText?.('');
            void onSubmit('');
            if (onClear) onClear();
        };

        return (
            <Input
                ref={ref as any}
                {...restOfProps}
                value={currentText}
                autoComplete='off'
                autoCorrect={false}
                autoCapitalize='none'
                autoFocus={true}
                containerStyle={{
                    backgroundColor: colors.grey5,
                    borderRadius: 20,
                }}
                inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 10 }}
                inputStyle={{ color: colors.grey1 }}
                rightIcon={{
                    name: text ? 'close-circle-outline' : 'magnify',
                    type: 'material-community',
                    color: colors.grey2,
                    onPress: clearText,
                }}
                multiline={false}
                renderErrorMessage={false}
                clearButtonMode='always'
                blurOnSubmit={false}
                onChangeText={handleChangeText}
                onSubmitEditing={(e) => handleSubmit(e.nativeEvent.text)}
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
