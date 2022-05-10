---
to: <%= h.components(name) %>/<%= name %>-item/<%= name %>-item.tsx
---
<%
plural = h.inflection.pluralize(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React, { useState } from 'react';

import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { <%= plural %>Actions, <%= singularCapitalized %>Entity, <%= singularCapitalized %>Service } from '@pos/<%= plural %>/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UIS3Image } from '@pos/shared/ui-native';

export interface <%= singularCapitalized %>ItemProps {
    item: <%= singularCapitalized %>Entity;
    navigation: NativeStackNavigationProp<any>;
}

export function <%= singularCapitalized %>Item({ item, navigation }: <%= singularCapitalized %>ItemProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await <%= singularCapitalized %>Service.delete(item.id);
        setBusy(false);
        dispatch(<%= plural %>Actions.remove(item.id));

    }

    const editItem = () => {
        dispatch(<%= plural %>Actions.select(item));
        navigation.navigate('<%= singularCapitalized %> Form');
    }

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => deleteItem() },
            ]
        );
    }

    return (
        <View style={styles.dataRow}>
            { busy &&
            <ActivityIndicator size='small' />
            }
            <UIS3Image s3Key={item.picture} width={50} height={50} />
            <View style={{ flex: 5 }}>
                <Text style={styles.name}>Sample name</Text>
            </View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Button
                    type="clear"
                    title="Edit"
                    icon={{
                        name: 'pencil-outline',
                        type: 'material-community',
                    }}
                    onPress={editItem}
                />
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    onPress={confirmDeletion}
                />
            </View>
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            dataRow: {
                ...sharedStyles.row,
                padding: 20,
                backgroundColor: `${theme.theme.colors.searchBg}44`,
                borderRadius: 10,
                marginBottom: 10,
            },
            name: {
                fontSize: 18,
                color: theme.theme.colors.grey0,
                marginBottom: 5,
            },
        }),
    };
};

export default <%= singularCapitalized %>Item;