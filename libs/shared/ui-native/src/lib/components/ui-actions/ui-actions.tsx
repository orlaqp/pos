import React from 'react';
import { Button, useTheme } from '@rneui/themed';

import { StyleProp, View, ViewStyle } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';

/* eslint-disable-next-line */
export interface UiActionBarProps {
    busy: boolean;
    submitTitle?: string;
    cancelTitle?: string;
    submitTestID?: string;
    cancelTestID?: string;
    submitLoading?: boolean;
    submitAction: () => unknown;
    cancelAction: () => unknown;
    submitButtonStyle?: StyleProp<ViewStyle>;
    cancelButtonStyle?: StyleProp<ViewStyle>;
}

export function UIActions(props: UiActionBarProps) {
    const theme = useTheme();
    const colors = theme?.theme?.colors || {
        grey5: '#444444',
        grey0: '#ffffff',
        grey1: '#dddddd',
    };
    const sharedStyles = useSharedStyles();

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
            }}
        >
            <Button
                testID={props.cancelTestID || 'ui-actions-cancel-button'}
                title={props.cancelTitle || 'Cancel'}
                type="clear"
                onPress={props.cancelAction}
                icon={{
                    name: 'cancel',
                    type: 'material-community',
                    color: props.busy ? colors.grey5 : colors.grey0,
                }}
                style={{ marginRight: 20 }}
                buttonStyle={[
                    {
                        borderRadius: 22,
                        minHeight: 44,
                        paddingHorizontal: 18,
                    },
                    props.cancelButtonStyle,
                ]}
                titleStyle={{
                    paddingRight: 20,
                    color: colors.grey1,
                }}
                disabled={props.busy}
                disabledStyle={sharedStyles.darkBackground}
                disabledTitleStyle={{ color: colors.grey5 }}
            />
            <Button
                testID={props.submitTestID || 'ui-actions-submit-button'}
                title={props.submitTitle || 'Save'}
                onPress={props.submitAction}
                loading={props.submitLoading}
                icon={{
                    name: 'check',
                    type: 'material-community',
                    color:
                        props.busy && !props.submitLoading
                            ? colors.grey5
                            : colors.grey0,
                }}
                buttonStyle={[
                    {
                        borderRadius: 22,
                        minHeight: 44,
                        paddingHorizontal: 18,
                    },
                    props.submitButtonStyle,
                ]}
                titleStyle={{
                    paddingRight: 20,
                }}
                disabled={props.busy}
                disabledStyle={sharedStyles.darkBackground}
                disabledTitleStyle={{ color: colors.grey5 }}
            />
        </View>
    );
}

export default UIActions;
