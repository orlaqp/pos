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
import { AssetsService } from './assets.service';
import UISpinner from '../ui-spinner/ui-spinner';
import { cancellablePromise } from '@pos/shared/utils';

const fakePromise = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve('abc'), 2000);
    });
};

/* eslint-disable-next-line */
export interface UiFileUploadProps {
    message?: string;
    prefix: string;
    imageKey: string | null | undefined;
    width?: number;
    height?: number;
    onAssetUploaded?: (key: string) => void;
    onAssetRemoved?: (key: string) => void;
}

export function UiFileUpload({
    message,
    prefix,
    imageKey,
    height,
    width,
    onAssetUploaded,
    onAssetRemoved
}: UiFileUploadProps) {
    
    const theme = useTheme();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
    const [s3Key, setS3Key] = useState<string | null | undefined>(imageKey);
    const [imageUri, setImageUri] = useState<string | null | undefined>();

    const deleteImage = async () => {
        if (!s3Key) return;

        setBusy(true);
        await AssetsService.deleteAsset(s3Key);
        
        if (onAssetRemoved) onAssetRemoved(s3Key);

        setS3Key(null);
        setBusy(false);
    }

    useEffect(() => {
        if (!s3Key) return setImageUri(undefined);
        setBusy(true);
        const { promise, cancel } = cancellablePromise<string>(AssetsService.getAssetUri(s3Key));

        promise.then((uri: string) => {
            setImageUri(uri);
            setBusy(false);
        });

        return cancel;
    }, [s3Key])

    const processUpload = async () => {
        setBusy(true);
        const res = await AssetsService.uploadAsset('photo', prefix);

        if (!res) {
            return alert(
                `There was an error uploading your picture.
                 Please try again later or contact support`
            );
        }

        if (!res.cancel && res.key) {
            setS3Key(res.key);
            if (onAssetUploaded) onAssetUploaded(res.key);
        }

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
            { imageUri && 
            <TouchableOpacity
                style={{ position: 'absolute', top: -12, left: (width || 125) - 14 }}
                onPress={() => deleteImage()}
            >
                <Icon name='close-circle' type='material-community' size={32} />
            </TouchableOpacity>
            }
        </View>
    );
}

export default UiFileUpload;
