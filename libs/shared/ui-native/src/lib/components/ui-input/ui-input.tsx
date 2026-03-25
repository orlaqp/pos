import { useSharedStyles } from '@pos/theme/native';
import { InputProps } from '@rneui/base';
import { Input, useTheme } from '@rneui/themed';
import React, { useState } from 'react';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { TextInput } from 'react-native';

type Props = InputProps & {
    name: string;
    placeholder: string;
    rules?: RegisterOptions;
    validationLength?: number;
    lIcon?: string;
    rIcon?: string;
    formatter?: (oldValue: string, newValue: string) => string;
    onValid?: () => void;
};

export const UIInput: any = React.forwardRef<any, Props>((props, ref) => {
    const theme = useTheme();
    const styles = useSharedStyles();
    const { name, rules, formatter, onValid, lIcon, rIcon, textAlign, ...restOfProps } =
        props;
    const { control } = useFormContext();
    const [focused, setFocused] = useState(false);

    const inputProps = restOfProps as InputProps;
    const nativeInputTestId =
        typeof inputProps.testID === 'string' ? inputProps.testID : undefined;
    inputProps.leftIcon = lIcon
        ? {
              name: lIcon,
              type: 'material-community',
              color: theme.theme.colors.grey2,
          }
        : inputProps.leftIcon;
    inputProps.rightIcon = rIcon
        ? {
              name: rIcon,
              type: 'material-community',
              color: theme.theme.colors.grey2,
          }
        : inputProps.rightIcon;

    //   const value = watch(name)

    //   useEffect(() => {
    //     async function validate() {
    //       const isValid = await trigger(name)
    //       if (isValid) onValid?.()
    //     }

    //     if (value?.length >= validationLength) {
    //       validate()
    //     }
    //   }, [value, name, validationLength, trigger]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Controller
            control={control}
            name={name}
            defaultValue=""
            render={({
                field: { onChange, value, onBlur, ref: fieldRef },
                fieldState: { isTouched, isDirty, error },
            }) => (
                <Input
                    ref={fieldRef as any}
                    {...inputProps}
                    inputProps={{
                        ...inputProps.inputProps,
                        testID:
                            inputProps.inputProps?.testID || nativeInputTestId,
                        nativeID:
                            inputProps.inputProps?.nativeID || nativeInputTestId,
                    }}
                    textAlign={textAlign || 'left'}
                    placeholder={props.placeholder}
                    value={
                        typeof value === 'string'
                            ? value
                            : value == null
                            ? ''
                            : String(value)
                    }
                    onBlur={(event) => {
                        setFocused(false);
                        onBlur();
                        inputProps.onBlur?.(event);
                    }}
                    onFocus={(event) => {
                        setFocused(true);
                        inputProps.onFocus?.(event);
                    }}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                    inputContainerStyle={[
                        styles.inputContainerStyle,
                        focused
                            ? {
                                  borderWidth: 1,
                                  borderColor: theme.theme.colors.primary,
                              }
                            : undefined,
                    ]}
                    inputStyle={styles.inputStyle}
                />
            )}
            rules={rules}
        />

        // <Controller
        //   control={control}
        //   render={({
        //       field: { onChange, onBlur, value, name, ref },
        //       fieldState: { invalid, isTouched, isDirty, error },
        //     formState,
        //   }) => (
        //     <Input
        //       {...restOfProps}
        //       ref={ref}
        //       testID={`TextField.${name}`}
        //       errorMessage={error?.message}
        //       onBlur={(event) => {
        //           debugger;
        //         onBlur()
        //       }}
        //       onChangeText={(text) => {
        //           debugger;
        //         const formatted = formatter ? formatter(value, text) : text
        //         onChange(formatted)
        //       }}
        //       value={value}
        //     />
        //   )}
        //   name={name}
        //   rules={rules}
        // />
    );
});
