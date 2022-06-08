import { Storage } from 'aws-amplify';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';
import { Readable } from 'stream';
import { blobToBase64 } from './conversion.service';
import { FsService } from './fs.service';

export interface UploadResponse {
    cancel?: boolean;
    errorMessage?: string;
    key?: string;
}

export type GetAssetResponse = Readable | ReadableStream | Blob | undefined;

export class AssetsService {
    static async uploadAsset(mediaType: MediaType, keyPrefix: string): Promise<UploadResponse | null> {
        try {
            // TODO: Refactor this out to its own service
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
      
            const response = await fetch(asset?.uri);
            const blob = await response.blob();
      
            const key = `${keyPrefix}/${asset?.fileName}`;
            await Storage.put(key, blob);
      
            return { key, cancel: false };
        } catch (error: any) {
            console.error('error', error);
            return { errorMessage: error.message };
        }
    };
    
    static getAssetUri(key: string) {
        return Storage.get(key, { download: false });
    }

    static async getImage(key: string): Promise<string> {
        // check if image is stored in cache
        const content = await FsService.get(key);

        if (content) return content;

        const res = await Storage.get(key, { download: true });
        let base64: string = (await blobToBase64(res.Body)) as any;

        const extension = key.split('.').pop();
        base64 = base64.replace('data:binary/octet-stream;', `data:image/${extension};`);

        await FsService.save(key, base64);

        return base64 as string;
    }
    
    static deleteAsset(key: string) {
        return Storage.remove(key);
    }

}

