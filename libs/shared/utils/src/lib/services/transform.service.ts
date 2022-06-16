import { Dictionary } from '@reduxjs/toolkit';

export class Transform {

    static toObject<T>(arr: any[] | undefined, key: string): Dictionary<T> {
        if (!arr) return {};

        let output = {};
        arr.reduce((res, i) => {
            res[i[key]] = i;
            return res;
        }, output);

        return output;
    }
    
}