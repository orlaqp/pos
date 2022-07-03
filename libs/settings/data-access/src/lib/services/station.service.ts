import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StationConfig {
    no: number;
}


export const setStationNumber = (n: number) => {
    return AsyncStorage.setItem('', '');
}