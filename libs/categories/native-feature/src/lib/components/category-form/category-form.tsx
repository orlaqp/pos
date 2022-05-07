import { Button, Text, useTheme } from '@rneui/themed';
import React, { useState } from 'react';
import { Storage } from 'aws-amplify';

import { View, StyleSheet, Image } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { theme, useSharedStyles } from '@pos/theme/native';
import { UIInput } from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { Category } from '@pos/models';

/* eslint-disable-next-line */
export interface CategoryFormProps {}

export function CategoryForm(props: CategoryFormProps) {
    const styles = useStyles();
    const theme = useTheme();
    const [picturePath, setPicturePath] = useState();

    const launchLibrary = async () => {
        try {
            const res = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
            });
            const asset = res.assets?.at(0);

            if (!asset?.uri) return;
            console.log('asset', asset);

            const response = await fetch(asset?.uri);
            console.log('fetch response', response);

            const blob = await response.blob();
            console.log('blob');

            const key = `category-${asset?.fileName}`;
            const putRes = await Storage.put(key, blob);
            console.log('put response', putRes);
            console.log(putRes.key);

            const signedUrl = await Storage.get(key, { download: false });
            console.log('Signed URL', signedUrl);
        } catch (error) {
            console.error('error', error);
        }
    };

    const formMethods = useForm<Category>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            color: '',
            // picture: ''
        },
    });

    return (
        <FormProvider {...formMethods}>
            <View style={{ width: '60%', flexDirection: 'row' }}>
                <View style={{ flex: 3, marginRight: 25 }}>
                    {picturePath && (
                        <Image
                            source={picturePath}
                            style={{ width: 125, height: 125 }}
                        />
                    )}
                    {!picturePath && (
                        <>
                            <View
                                style={{
                                    ...styles.darkBackground,
                                    ...styles.centered,
                                    width: 125,
                                    height: 125,
                                    borderRadius: 4,
                                }}
                            >
                                <Text
                                    style={{
                                        color: theme.theme.colors.grey1,
                                        textAlign: 'center',
                                    }}
                                >
                                    No image {'\n'}found
                                </Text>
                            </View>
                            <Button
                                style={{ marginTop: 25 }}
                                type='outline'
                                title={'Upload'}
                                icon={{ name: 'tray-arrow-up', color: theme.theme.colors.grey3, type: 'material-community' }}
                            />
                        </>
                    )}
                </View>
                <View style={{ flex: 9 }}>
                    <UIInput
                        name="name"
                        placeholder="Name"
                        rules={{ required: 'Name is required' }}
                    />
                    <UIInput
                        name="description"
                        placeholder="Description"
                        rules={{ required: 'Description is required' }}
                    />
                </View>
            </View>
        </FormProvider>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({}),
    };
};

export default CategoryForm;
