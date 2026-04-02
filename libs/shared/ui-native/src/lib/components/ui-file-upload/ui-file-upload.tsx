import React, { useEffect, useState } from 'react';
import { useSharedStyles } from '@pos/theme/native';
import { Icon, useTheme } from '@rneui/themed';

import {
    Alert,
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import { AssetsService } from '@pos/shared/utils';
import UISpinner from '../ui-spinner/ui-spinner';

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
    const colors = theme?.theme?.colors || { grey1: '#dddddd' };
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
    const [s3Key, setS3Key] = useState<string | null | undefined>(imageKey);
    const [imageUri, setImageUri] = useState<string | null | undefined>();

    useEffect(() => {
        setS3Key(imageKey);
    }, [imageKey]);

    const deleteImage = async () => {
        if (!s3Key) return;

        setBusy(true);
        try {
            await AssetsService.deleteAsset(s3Key);
            if (onAssetRemoved) onAssetRemoved(s3Key);
            setS3Key(null);
            setImageUri(undefined);
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        let active = true;

        if (!s3Key) {
            setBusy(false);
            setImageUri(undefined);
            return () => {
                active = false;
            };
        }

        setBusy(true);

        void AssetsService.getAssetUri(s3Key)
            .catch(() => AssetsService.getImage(s3Key))
            .then((resolvedImage) => {
                if (!active) return;
                setImageUri(resolvedImage);
            })
            .catch((error) => {
                console.error('Unable to restore uploaded image', error);
                if (!active) return;
                setImageUri(undefined);
            })
            .finally(() => {
                if (!active) return;
                setBusy(false);
            });

        return () => {
            active = false;
        };
    }, [s3Key]);

    const processUpload = async () => {
        setBusy(true);
        try {
            const res = await AssetsService.uploadAsset('photo', prefix);

            if (!res) {
                Alert.alert(
                    'Image upload failed',
                    'There was an error uploading your picture. Please try again later or contact support.'
                );
                return;
            }

            if (!res.cancel && res.key) {
                setS3Key(res.key);
                if (onAssetUploaded) onAssetUploaded(res.key);
            }
        } finally {
            setBusy(false);
        }
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
                onPress={processUpload}
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
                                color: colors.grey1,
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
