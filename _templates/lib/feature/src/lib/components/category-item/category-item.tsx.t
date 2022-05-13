---
to: <%= h.components(name) %>/<%= h.paramCase(name) %>-item/<%= h.paramCase(name) %>-item.tsx
---
<%
plural = h.inflection.pluralize(name)
pluralParamCase = h.pluralParamCase(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React, { useState } from 'react';

import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { <%= plural %>Actions, <%= singularCapitalized %>Entity, <%= singularCapitalized %>Service } from '@pos/<%= pluralParamCase %>/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface <%= singularCapitalized %>ItemProps {
    item: <%= singularCapitalized %>Entity;
    navigation: NativeStackNavigationProp<any>;
}

export function <%= singularCapitalized %>Item({ item, navigation }: <%= singularCapitalized %>ItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
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

export default <%= singularCapitalized %>Item;
