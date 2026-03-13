import React, { useEffect, useState } from 'react';

import { Image } from 'react-native';
import { AssetsService } from '@pos/shared/utils';

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
    factor?: number;
}

const imageUriCache = new Map<string, string>();
const pendingImageLoads = new Map<string, Promise<string>>();

const resolveImageUri = async (s3Key: string): Promise<string> => {
    const cached = imageUriCache.get(s3Key);
    if (cached) return cached;

    const inflight = pendingImageLoads.get(s3Key);
    if (inflight) return inflight;

    const request = AssetsService.getAssetUri(s3Key)
        .catch(() => AssetsService.getImage(s3Key))
        .then((uri) => {
            imageUriCache.set(s3Key, uri);
            return uri;
        })
        .finally(() => {
            pendingImageLoads.delete(s3Key);
        });

    pendingImageLoads.set(s3Key, request);
    return request;
};

export function UIS3Image({
    s3Key,
    width,
    height,
}: UIS3ImageProps) {
    const [uri, setUri] = useState<string | undefined>();

    useEffect(() => {
        let mounted = true;

        if (!s3Key) {
            setUri(undefined);
            return () => {
                mounted = false;
            };
        }

        resolveImageUri(s3Key)
            .then((resolved) => {
                if (mounted) setUri(resolved);
            })
            .catch(() => {
                if (mounted) setUri(undefined);
            });

        return () => {
            mounted = false;
        };
    }, [s3Key]);

    if (!uri) return null;

    return (
        <Image
            style={{ height, width }}
            source={{ uri }}
            resizeMode="contain"
        />
    );
}

export default UIS3Image;
