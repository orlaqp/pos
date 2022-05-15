import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import { StateToString } from 'redux-logger';
import UIS3Image from '../ui-s3-image/ui-s3-image';

export interface ButtonItem {
    id?: string;
    name: string;
    picture?: string | null | undefined;
}

export type ButtonItemType = Readonly<ButtonItem & Record<string, any>>;

/* eslint-disable-next-line */
export interface UIButtonProps {
    onSelected: (item: ButtonItemType) => void;
    item: ButtonItemType;
    maxTextLength?: number;
}

export function UIButton({ item, onSelected, maxTextLength }: UIButtonProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const textLength = maxTextLength || 14;

    return (
        <TouchableOpacity
            key={item.id}
            onPress={() => onSelected(item)}
            style={{ padding: 10 }}
        >
            <View style={[styles.centered]}>
                <UIS3Image
                    s3Key={item.picture}
                    width={35}
                    height={35}
                    factor={1.5}
                />
                <Text
                    style={{
                        color: theme.theme.colors.black,
                        fontSize: 12,
                        textAlign: 'center'
                    }}
                >
                    {
                        item.name.length > textLength
                            ? `${item.name.substring(0, textLength)}...`
                            : item.name
                    }
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default UIButton;
