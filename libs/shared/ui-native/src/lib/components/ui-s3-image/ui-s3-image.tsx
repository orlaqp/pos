import { selectAwsConfig } from '@pos/settings/data-access';
import React from 'react';

import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';

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

export function UIS3Image({
    size,
    s3Key,
    width,
    height,
    factor,
}: UIS3ImageProps) {
    const awsConfig = useSelector(selectAwsConfig);
    // const [uri, setUri] = useState<string | undefined>();
    // const [busy, setBusy] = useState<boolean>(false);

    // useEffect(() => {
    //     if (!s3Key) {
    //         setBusy(false);
    //         return setUri(undefined);
    //     }

    //     setBusy(true);

    //     const { promise, cancel } = cancellablePromise<string | undefined>(
    //         AssetsService.getImage(s3Key)
    //         // CacheService.getImage(s3Key)
    //     );

    //     promise.then((base64Image: string | undefined) => {
    //         setUri(base64Image);
    //         setBusy(false);
    //     });

    //     return cancel;
    // }, [s3Key]);

    // useEffect(() => {
    //     if (!s3Key) {
    //         setBusy(false);
    //         return setUri(undefined);
    //     }

    //     setBusy(true);

    //     const { promise, cancel } = cancellablePromise<string>(AssetsService.getAssetUri(s3Key));

    //     promise.then((uri: string) => {
    //         setUri(uri);
    //         setBusy(false);
    //     });

    //     return cancel;
    // }, [s3Key]);

    return (
        <FastImage
            style={{height, width, flex: 1.3 }}
            //source={{uri: `https://pos-assets-667d29297354387b6c48c731f59df31110831-develop.s3.amazonaws.com/public/${s3Key}`}}
            source={{uri: `https://${awsConfig?.aws_user_files_s3_bucket}.s3.amazonaws.com/public/${s3Key}`}}
            resizeMode="contain"
        />

        // source={{uri: `https://${awsConfig?.aws_user_files_s3_bucket}.s3.amazonaws.com/public/${s3Key}`}}

        // <>
        //     {busy && (
        //         <View style={{ width, height }}>
        //             <ActivityIndicator size={size || 'small'} />
        //         </View>
        //     )}
        //     {!busy && uri && (
        //         <Image
        //             source={{ uri }}
        //             // style={{ width: width || 95, height: height || 115 }}
        //             resizeMode="contain"
        //             style={{
        //                 flex: 1.3,
        //                 height: (factor || 2) * 25,
        //                 width: (factor || 2) * 100,
        //             }}
        //         />
        //     )}
        // </>
    );
}

export default UIS3Image;
