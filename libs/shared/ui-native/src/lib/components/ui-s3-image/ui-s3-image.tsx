import { useSharedStyles } from '@pos/theme/native';
import React, { useEffect, useState } from 'react';

import { ActivityIndicator, Image, View } from 'react-native';
import { serialize } from 'v8';
import { AssetsService } from '../ui-file-upload/assets.service';

/* eslint-disable-next-line */
export interface UIS3ImageProps {
    /**
     * Size of the indicator.
     * Small has a height of 20, large has a height of 36.
     *
     * enum('small', 'large')
     */
    size?: number | 'small' | 'large' | undefined;
    s3Key: string | null | undefined;
    width: number;
    height: number;
}

export function UIS3Image({ size, s3Key, width, height }: UIS3ImageProps) {
    const [uri, setUri] = useState<string | undefined>();
    const [busy, setBusy] = useState<boolean>(false);
    
    useEffect(() => {
        async function getImageUri() {
            setBusy(true);
            if (!s3Key) {
                return setUri(undefined);
            }
            setUri(await AssetsService.getAssetUri(s3Key));
            setBusy(false);
        }

        getImageUri();
    }, [s3Key]);

    return (
        <>
            { busy && 
            <View style={{ width, height }}>
                <ActivityIndicator size={ size || 'small' } />
            </View>
            }
            { !busy && uri &&
            <Image
                source={{ uri }}
                // style={{ width: width || 95, height: height || 115 }}
                resizeMode="contain"
                style={{
                    flex: 1.3,
                    height: 2 * 25,
                    width: 2 * 100,
                }}
            />
            }
        </>
    );
}

export default UIS3Image;
