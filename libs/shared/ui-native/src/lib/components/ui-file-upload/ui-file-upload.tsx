import React, { useEffect, useState } from 'react';
import { useSharedStyles } from '@pos/theme/native';
import { Icon, useTheme } from '@rneui/themed';

import {
    View,
    Text,
    Image,
    ImageSourcePropType,
    TouchableOpacity,
} from 'react-native';
import { getAssetUri, uploadAsset } from './upload.service';
import UISpinner from '../ui-spinner/ui-spinner';

const fakePromise = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve('abc'), 2000);
    });
};

/* eslint-disable-next-line */
export interface UiFileUploadProps {
    message?: string;
    key?: string;
    width?: number;
    height?: number;
}

export function UiFileUpload({
    message,
    key,
    height,
    width,
}: UiFileUploadProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
    const [s3Key, setS3Key] = useState<string | undefined>(key);
    const [imageUri, setImageUri] = useState<string | undefined>(key);

    useEffect(() => {
        async function fetchImageUri() {
            console.log('Fetching image uri for: ' + s3Key);
            
            if (!s3Key) return setImageUri(undefined);

            const uri = await getAssetUri(s3Key);
            console.log(`Uri: ${uri}`);
            
            setImageUri(uri);
        }

        fetchImageUri();
    }, [s3Key])

    const processUpload = async () => {
        setBusy(true);
        const key = await uploadAsset('photo', 'categories');

        if (!key) {
            return alert(
                `There was an error uploading your picture. Please try again later or contact support`
            );
        }
        setS3Key(key);
        setBusy(false);
    };

    return (
        <View style={{ marginRight: 25 }}>
            <TouchableOpacity
                style={{
                    ...styles.darkBackground,
                    ...styles.centered,
                    width: width || 125,
                    height: height || 125,
                    borderRadius: 4,
                }}
                onPress={async () => await processUpload()}
            >
                {imageUri && !busy && (
                    <Image
                        source={{ uri: imageUri }}
                        // style={{ width: width || 95, height: height || 115 }}
                        resizeMode='contain'
                        style={{
                            height: 4*25,
                            width: 4*100,
                        }}
                        
                    />
                )}
                {busy && <UISpinner size="small" />}
                {!imageUri && !busy && (
                    <>
                        <Icon
                            name="tray-arrow-up"
                            type="material-community"
                            style={{ marginBottom: 10 }}
                        />
                        <Text
                            style={{
                                color: theme.theme.colors.grey1,
                                textAlign: 'center',
                            }}
                        >
                            {message || 'Touch to\nUpload'}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

export default UiFileUpload;
