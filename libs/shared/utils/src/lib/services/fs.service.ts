import RNFS, { writeFile, readFile, exists } from 'react-native-fs';

const basePath = RNFS.CachesDirectoryPath;

export class FsService {
    static has(name: string) {
        const path = getFullPath(name);
        return exists(path);
    }

    static save(name: string, content: string) {
        const path = getFullPath(name);
        // console.log(`Storing image: ${path}`);

        return writeFile(path, content);
    }

    static async get(name: string) {
        const path = getFullPath(name);
        const wasFound = await exists(path);

        if (wasFound) {
            // console.log(`Found in cache: ${path}`);
            return readFile(path);
        }

        return null;
    }

    static getPath(name: string) {
        return getFullPath(name);
    }

    static async getFileUri(name: string) {
        const path = getFullPath(name);
        const wasFound = await exists(path);

        if (!wasFound) {
            return null;
        }

        return `file://${path}`;
    }

    static async download(name: string, fromUrl: string) {
        const path = getFullPath(name);
        const result = await RNFS.downloadFile({
            fromUrl,
            toFile: path,
        }).promise;

        if (result.statusCode && result.statusCode >= 400) {
            throw new Error(`Image download failed with status ${result.statusCode}`);
        }

        return `file://${path}`;
    }

}

const getFullPath = (name: string) =>
    `${basePath}/${name.replace(/[\\/]/g, '__')}`;
