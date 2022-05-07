import { Storage } from 'aws-amplify';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';

export const uploadAsset = async (mediaType: MediaType, keyPrefix: string): Promise<string | null> => {
    try {
        const res = await launchImageLibrary({
            mediaType: mediaType || 'photo',
            selectionLimit: 1,
        });
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

        return key;
    } catch (error) {
        console.error('error', error);
        return null;
    }
};

export const getAssetUri = (key: string) => {
    return Storage.get(key, { download: false });
}