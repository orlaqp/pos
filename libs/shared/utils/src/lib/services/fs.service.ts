import RNFS, { writeFile, readFile, exists, stat, unlink } from 'react-native-fs';

const basePath = RNFS.CachesDirectoryPath;

export class FsService {

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

    static async getInfo(name: string) {
        const path = getFullPath(name);
        const wasFound = await exists(path);

        if (!wasFound) {
            return null;
        }

        const fileStats = await stat(path);
        return {
            path,
            modifiedTime:
                fileStats.mtime instanceof Date
                    ? fileStats.mtime.getTime()
                    : new Date(fileStats.mtime).getTime(),
        };
    }

    static async remove(name: string) {
        const path = getFullPath(name);
        const wasFound = await exists(path);

        if (!wasFound) {
            return;
        }

        await unlink(path);
    }

}

const getFullPath = (name: string) => `${basePath}/${name.replace('/', '__')}`;
