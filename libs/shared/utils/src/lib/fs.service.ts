import RNFS, { writeFile, readFile, exists } from 'react-native-fs';

const basePath = RNFS.CachesDirectoryPath;

export class FsService {

    static save(name: string, content: string) {
        const path = getFullPath(name);
        console.log(`Storing image: ${path}`);

        return writeFile(path, content);
    }

    static async get(name: string) {
        const path = getFullPath(name);
        const wasFound = await exists(path);

        if (wasFound) {
            console.log(`Found in cache: ${path}`);
            return readFile(path);
        }

        return null;
    }

}

const getFullPath = (name: string) => `${basePath}/${name.replace('/', '__')}`;