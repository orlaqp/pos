import AsyncStorage from '@react-native-async-storage/async-storage';

const ORDER_NUMBER_KEY = 'orderNumber';

export interface StationConfig {
    orderNumber: number;
}

export class StationService {

    static async getNextOrderNumber() {
        let current = await AsyncStorage.getItem(ORDER_NUMBER_KEY);
    
        if (!current) {
            current = '0';
        }
    
        const newNumber = +current + 1;
    
        await AsyncStorage.setItem(ORDER_NUMBER_KEY, newNumber.toString());
    
        return newNumber;
    }

}


