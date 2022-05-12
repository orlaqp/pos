import { Icon, InputProps } from '@rneui/base';
import { Input, useTheme } from '@rneui/themed';
import React, { useEffect } from 'react';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { TextInput } from 'react-native';

type Props = React.ComponentProps<typeof TextInput> & {
    name: string;
    placeholder: string;
    rules?: RegisterOptions;
    validationLength?: number;
    lIcon?: string;
    rIcon?: string;
    formatter?: (oldValue: string, newValue: string) => string;
    onValid?: () => void;
};

export const UIInput = React.forwardRef<TextInput, Props>((props, ref) => {
    const theme = useTheme();
    const { name, rules, formatter, onValid, lIcon, rIcon, ...restOfProps } =
        props;
    const { control } = useFormContext();

    const inputProps = restOfProps as InputProps;
    inputProps.leftIcon = lIcon
        ? {
              name: lIcon,
              type: 'material-community',
              color: theme.theme.colors.grey2,
          }
        : undefined;
    inputProps.rightIcon = rIcon
        ? {
              name: rIcon,
              type: 'material-community',
              color: theme.theme.colors.grey2,
          }
        : undefined;

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
            render={({
                field: { onChange, value, onBlur, ref },
                fieldState: { isTouched, isDirty, error },
            }) => (
                <Input
                    ref={ref}
                    {...restOfProps}
                    placeholder={props.placeholder}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(value) => onChange(value)}
                    errorMessage={error?.message}
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
