---
to: <%= h.components(name) %>/<%= h.paramCase(name) %>-form/<%= h.paramCase(name) %>-form.tsx
---
<%
plural = h.inflection.pluralize(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React, { useState } from 'react';

import { Alert, View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import {
    UIActions,
    UiFileUpload,
    UIInput,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import {
    <%= singularCapitalized %>Entity,
    <%= singularCapitalized %>Service,
} from '@pos/<%= h.pluralParamCase(name) %>/data-access';
import { RootState } from '@pos/store';
import { <%= singularCapitalized %> } from '@pos/shared/models';

export interface <%= singularCapitalized %>FormParams {
    [name: string]: object | undefined;
    <%= name %>: <%= singularCapitalized %>;
}

export interface <%= singularCapitalized %>FormProps {
    navigation: NativeStackNavigationProp< <%= singularCapitalized %>FormParams>;
}

export function <%= singularCapitalized %>Form({ navigation }: <%= singularCapitalized %>FormProps) {
    const <%= name %> = useSelector((state: RootState) => state.<%= plural %>.selected);
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: <%= singularCapitalized %>Entity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await <%= singularCapitalized %>Service.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm< <%= singularCapitalized %>Entity >({
        mode: 'onChange',
        defaultValues: {
            id: <%= name %>?.id,
            // TODO: Update the rest of the properties here
        },
    });

    const confirmCancel = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => navigation.goBack() },
            ]
        );
    }

    return (
        <View style={[styles.page, styles.centeredHorizontally]}>
            <FormProvider {...form}>
                <View
                    style={{
                        width: '60%',
                        flexDirection: 'column',
                        marginTop: 50,
                    }}
                >
                    <UIInput name="name" placeholder="Name" />
                    <UIActions
                        busy={busy}
                        submitAction={form.handleSubmit(save)}
                        cancelAction={confirmCancel}
                    />
                </View>
            </FormProvider>
        </View>
    );
}

export default <%= singularCapitalized %>Form;
