import React from 'react';
import { Button, useTheme } from '@rneui/themed';

import { View } from 'react-native';

/* eslint-disable-next-line */
export interface UiActionBarProps {
    submitTitle?: string;
    cancelTitle?: string;
    submitAction: () => unknown;
    cancelAction: () => unknown;
}

export function UIActions(props: UiActionBarProps) {
    const theme = useTheme();

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
                title={props.cancelTitle || 'Cancel'}
                type="clear"
                onPress={props.cancelAction}
                icon={{
                    name: 'cancel',
                    type: 'material-community',
                    color: theme.theme.colors.grey1,
                }}
                style={{ marginRight: 20 }}
                titleStyle={{
                    paddingRight: 20,
                    color: theme.theme.colors.grey1
                }}
            />
            <Button
                title={props.submitTitle || 'Save'}
                onPress={props.submitAction}
                icon={{
                    name: 'check',
                    type: 'material-community',
                    color: theme.theme.colors.grey0,
                }}
                titleStyle={{
                    paddingRight: 20
                }}
            />
        </View>
    );
}

export default UIActions;
