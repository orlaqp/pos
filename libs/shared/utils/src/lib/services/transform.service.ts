type Dictionary<T> = Record<string, T | undefined>;

export class Transform {

    static toObject<T>(arr: any[] | undefined, key: string): Dictionary<T> {
        if (!arr) return {};

        const output: Dictionary<T> = {};
        arr.reduce((res, i) => {
            res[i[key]] = i;
            return res;
        }, output);

        return output;
    }
    
}
