import * as RNFS from 'react-native-fs';
import { Storage } from 'aws-amplify';
import { blobToBase64 } from './conversion.service';

const picturesDirectoryPath = RNFS.CachesDirectoryPath;

export class CacheService {
    static async getImage(key: string): Promise<string | undefined> {
        const path = picturePath(key);
        const exist = await RNFS.exists(path);

        if (!exist) {
            console.log(`Image ${key} does not exist in cache`);
            
            const res = await Storage.get(key, { download: true });
            let base64: string = (await blobToBase64(res.Body)) as any;
            const extension = key.split('.').pop();
            
            base64 = base64.replace(
                'data:binary/octet-stream;',
                `data:image/${extension};`
            );
            
            console.log(`Writing image ${key} to cache`);
            
            await RNFS.writeFile(path, base64);
        }

        return RNFS.readFile(path, 'base64');
    }

    static async setImage(key: string, uri: string) {
        await RNFS.downloadFile({
            fromUrl: uri,
            toFile: picturePath(key),
        });
    }
}

const picturePath = (key: string) => `${picturesDirectoryPath}/${key}`;
