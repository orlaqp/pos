import { Switch } from '@rneui/themed';
import React from 'react';
import { Text } from 'react-native';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import { useSharedStyles } from '@pos/theme/native';

type Props = React.ComponentProps<typeof Switch> & {
    name: string;
    label?: string;
    rules?: RegisterOptions;
};

export const UISwitch = React.forwardRef<typeof Switch, Props>((props, ref) => {
    const styles = useSharedStyles();
    const { name, rules, label, ...restOfProps } = props;
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            render={({
                field: { onChange, value, onBlur, ref },
                fieldState: { isTouched, isDirty, error },
            }) => (
                <>
                    <Switch
                        {...restOfProps}
                        value={value}
                        onValueChange={onChange}
                    />
                    { label &&
                    <Text
                        style={[
                            styles.labelText,
                            { marginTop: 5, marginRight: 15 },
                        ]}
                    >
                        {label}
                    </Text>
                    }
                </>
            )}
            rules={rules}
        />
    );
});
