import React, { useCallback, useMemo, useState } from 'react';

import { Input, useTheme } from '@rneui/themed';
import { NativeSyntheticEvent, TextInput, TextInputFocusEventData } from 'react-native';
// import debounce from 'lodash/debounce';
type UiSearchInputProps = React.ComponentProps<typeof TextInput> & {
    onSubmit: (text: string) => void | Promise<unknown>;
    onClear?: () => void;
    debounceTime?: number;
    clearOnSubmit?: boolean;
    retainFocusOnSubmit?: boolean;
    retainFocusOnBlur?: boolean;
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
            clearOnSubmit,
            retainFocusOnSubmit,
            retainFocusOnBlur,
            autoFocus,
            ...restOfProps
        } =
            props;
        const [text, setText] = useState<string>(typeof value === 'string' ? value : '');
        const currentText = typeof value === 'string' ? value : text;
        const inputRef = useMemo(
            () => ({ current: null as TextInput | null }),
            []
        );

        const setCombinedRef = useCallback(
            (node: TextInput | null) => {
                inputRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                    return;
                }

                if (ref) {
                    ref.current = node;
                }
            },
            [ref, inputRef]
        );

        const handleChangeText = (nextText: string) => {
            setText(nextText);
            onChangeText?.(nextText);
        };

        const handleSubmit = (submittedText?: string) => {
            const nextText = submittedText ?? currentText;
            setText(nextText);
            void onSubmit(nextText);

            if (clearOnSubmit) {
                setText('');
                onChangeText?.('');
            }

            if (retainFocusOnSubmit) {
                inputRef.current?.focus?.();
            }
        };

        const handleBlur = (
            event: NativeSyntheticEvent<TextInputFocusEventData>
        ) => {
            restOfProps.onBlur?.(event);

            if (retainFocusOnBlur) {
                setTimeout(() => {
                    inputRef.current?.focus?.();
                }, 25);
            }
        };

        const clearText = () => {
            setText('');
            onChangeText?.('');
            void onSubmit('');
            if (onClear) onClear();
        };

        return (
            <Input
                ref={setCombinedRef as any}
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
                autoFocus={autoFocus ?? true}
                blurOnSubmit={false}
                onChangeText={handleChangeText}
                onBlur={handleBlur}
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
