import React, { useEffect, useRef, useState } from 'react';

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
const IMAGE_URI_CACHE_TTL_MS = 10 * 60_000;
const imageUriResolvedAt = new Map<string, number>();

const resolveImageUri = async (
    s3Key: string,
    options?: { forceRefresh?: boolean }
): Promise<string> => {
    const forceRefresh = options?.forceRefresh ?? false;
    const resolvedAt = imageUriResolvedAt.get(s3Key) || 0;
    const cached = imageUriCache.get(s3Key);
    const cacheIsFresh =
        cached && Date.now() - resolvedAt < IMAGE_URI_CACHE_TTL_MS;
    if (!forceRefresh && cacheIsFresh) return cached;

    if (forceRefresh || !cacheIsFresh) {
        imageUriCache.delete(s3Key);
        imageUriResolvedAt.delete(s3Key);
    }

    const inflight = !forceRefresh ? pendingImageLoads.get(s3Key) : undefined;
    if (inflight) return inflight;

    const request = AssetsService.getImage(s3Key)
        .catch(() => AssetsService.getAssetUri(s3Key))
        .then((uri) => {
            imageUriCache.set(s3Key, uri);
            imageUriResolvedAt.set(s3Key, Date.now());
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
    const [reloadToken, setReloadToken] = useState(0);
    const [imageState, setImageState] = useState<{
        key?: string;
        uri?: string;
    }>({});
    const retryCountRef = useRef(0);

    useEffect(() => {
        let mounted = true;

        if (!s3Key) {
            retryCountRef.current = 0;
            return () => {
                mounted = false;
            };
        }

        if (reloadToken === 0) {
            retryCountRef.current = 0;
        }

        resolveImageUri(s3Key, { forceRefresh: retryCountRef.current > 0 })
            .then((resolved) => {
                if (mounted) {
                    setImageState({ key: s3Key, uri: resolved });
                    retryCountRef.current = 0;
                }
            })
            .catch(() => {
                if (mounted) {
                    setImageState({ key: s3Key, uri: undefined });
                }
            });

        return () => {
            mounted = false;
        };
    }, [reloadToken, s3Key]);

    if (!s3Key || imageState.key !== s3Key || !imageState.uri) return null;

    return (
        <Image
            testID="ui-s3-image"
            style={{ height, width }}
            source={{ uri: imageState.uri }}
            resizeMode="contain"
            onError={() => {
                if (!s3Key || retryCountRef.current >= 1) {
                    return;
                }

                imageUriCache.delete(s3Key);
                imageUriResolvedAt.delete(s3Key);
                pendingImageLoads.delete(s3Key);
                retryCountRef.current += 1;
                setReloadToken((current) => current + 1);
            }}
        />
    );
}

export default UIS3Image;
