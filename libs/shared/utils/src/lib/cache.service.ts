import * as RNFS from 'react-native-fs';

const picturesDirectoryPath = RNFS.PicturesDirectoryPath;

export class CacheService {
    static async getImage(key: string): Promise<string | null> {
        const path = picturePath(key);
        const exist = await RNFS.exists(path);

        return exist ? RNFS.readFile(path, 'base64') : null;
    }

    static async setImage(key: string, uri: string) {
        await RNFS.downloadFile({
            fromUrl: uri,
            toFile: picturePath(key),
        });
    }
}

const picturePath = (key: string) => `${picturesDirectoryPath}/key`;
