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

const clearCachedImageUri = (s3Key: string) => {
    imageUriCache.delete(s3Key);
    pendingImageLoads.delete(s3Key);
};

const resolveImageUri = async (
    s3Key: string,
    options?: { forceFresh?: boolean }
): Promise<string> => {
    const forceFresh = !!options?.forceFresh;
    const cached = !forceFresh ? imageUriCache.get(s3Key) : undefined;
    if (cached) return cached;

    const inflight = !forceFresh ? pendingImageLoads.get(s3Key) : undefined;
    if (inflight) return inflight;

    const request = (async () => {
        if (!forceFresh) {
            const cachedImage = await AssetsService.getCachedImage(s3Key);
            if (cachedImage) {
                return cachedImage;
            }
        }

        const assetUri = await AssetsService.getAssetUri(s3Key).catch(() =>
            AssetsService.getImage(s3Key, { forceRefresh: true })
        );

        if (!forceFresh) {
            void AssetsService.getImage(s3Key).catch(() => undefined);
        }

        return assetUri;
    })()
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
    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
        let mounted = true;

        if (!s3Key) {
            setUri(undefined);
            return () => {
                mounted = false;
            };
        }

        resolveImageUri(s3Key, {
            forceFresh: loadAttempt > 0,
        })
            .then((resolved) => {
                if (mounted) setUri(resolved);
            })
            .catch(() => {
                if (mounted) setUri(undefined);
            });

        return () => {
            mounted = false;
        };
    }, [loadAttempt, s3Key]);

    const onImageError = () => {
        if (!s3Key || loadAttempt >= 1) {
            return;
        }

        clearCachedImageUri(s3Key);
        void AssetsService.invalidateCachedImage(s3Key);
        setUri(undefined);
        setLoadAttempt((current) => current + 1);
    };

    useEffect(() => {
        setLoadAttempt(0);
    }, [s3Key]);

    if (!uri) return null;

    return (
        <Image
            style={{ height, width }}
            source={{ uri }}
            resizeMode="contain"
            onError={onImageError}
        />
    );
}

export default UIS3Image;
