import { Storage } from 'aws-amplify';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';

export interface UploadResponse {
    cancel?: boolean;
    errorMessage?: string;
    key?: string;
}

export const uploadAsset = async (mediaType: MediaType, keyPrefix: string): Promise<UploadResponse | null> => {
    try {
        const res = await launchImageLibrary({
            mediaType: mediaType || 'photo',
            selectionLimit: 1,
        });

        if (res.didCancel) {
            return { cancel: true };
        }

        if (res.errorCode) {
            return { errorMessage: res.errorMessage };
        }

        const asset = res.assets?.at(0);

        if (!asset?.uri) return null;
        console.log('asset', asset);

        const response = await fetch(asset?.uri);
        console.log('fetch response', response);

        const blob = await response.blob();
        console.log('blob');

        const key = `${keyPrefix}/${asset?.fileName}`;
        const putRes = await Storage.put(key, blob);
        console.log('put response', putRes);
        console.log(putRes.key);

        return { key, cancel: false };
    } catch (error: any) {
        console.error('error', error);
        return { errorMessage: error.message };
    }
};

export const getAssetUri = (key: string) => {
    return Storage.get(key, { download: false });
}

export const deleteAsset = (key: string) => {
    return Storage.remove(key);
}