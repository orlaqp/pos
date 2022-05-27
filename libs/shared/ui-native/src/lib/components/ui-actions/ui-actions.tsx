import React from 'react';
import { Button, useTheme } from '@rneui/themed';

import { View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';

/* eslint-disable-next-line */
export interface UiActionBarProps {
    busy: boolean;
    submitTitle?: string;
    cancelTitle?: string;
    submitAction: () => unknown;
    cancelAction: () => unknown;
}

export function UIActions(props: UiActionBarProps) {
    const theme = useTheme()
    const sharedStyles = useSharedStyles();

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
                title={props.cancelTitle || 'Cancel'}
                type="clear"
                onPress={props.cancelAction}
                icon={{
                    name: 'cancel',
                    type: 'material-community',
                    color: props.busy ? theme.theme.colors.grey5 : theme.theme.colors.grey0,
                }}
                style={{ marginRight: 20 }}
                titleStyle={{
                    paddingRight: 20,
                    color: theme.theme.colors.grey1
                }}
                disabled={props.busy}
                disabledStyle={sharedStyles.darkBackground}
                disabledTitleStyle={{ color: theme.theme.colors.grey5 }}
            />
            <Button
                title={props.submitTitle || 'Save'}
                onPress={props.submitAction}
                icon={{
                    name: 'check',
                    type: 'material-community',
                    color: props.busy ? theme.theme.colors.grey5 : theme.theme.colors.white,
                }}
                titleStyle={{
                    paddingRight: 20
                }}
                disabled={props.busy}
                disabledStyle={sharedStyles.darkBackground}
                disabledTitleStyle={{ color: theme.theme.colors.grey5 }}
            />
        </View>
    );
}

export default UIActions;
