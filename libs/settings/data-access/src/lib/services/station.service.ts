import { EmployeeEntity } from '@pos/employees/data-access';
import { OrderEntityMapper } from '@pos/orders/data-access';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { Alert } from 'react-native';

const STATION_CONFIG = 'stationConfig';

export interface StationConfig {
    stationNumber?: string;
    currentDate?: string;
    orderNumber?: number;
}

export class StationService {
    static async getConfig(): Promise<StationConfig> {
        const stationConfigString = await AsyncStorage.getItem(STATION_CONFIG);
        return stationConfigString
            ? JSON.parse(stationConfigString)
            : {};
    }

    static async saveStationNo(stationNumber: string) {
        const config = await StationService.getConfig();
        config.stationNumber = stationNumber;
        StationService.save(config);
    }

    static async isStationNumberSet() {
        const config = await StationService.getConfig();
        return config.stationNumber !== undefined && config.stationNumber !== null;
    }

    static async getNextOrderNumber(employee: EmployeeEntity) {
        const config = await StationService.getConfig();

        if (!config.stationNumber) {
            Alert.alert(
                'Error',
                'You cannot make sales before configuring the station code'
            );
        }

        const today = moment();
        const orderDateString = today.format('YYMMDD');

        if (
            !config.currentDate ||
            !config.orderNumber ||
            config.currentDate !== orderDateString
        ) {
            config.currentDate = orderDateString;
            config.orderNumber = 0;
        }

        config.orderNumber += 1;

        await StationService.save(config);

        return `${config.stationNumber}-${employee.code}-${orderDateString}-${config.orderNumber.toString().padStart(5, '0')}`;
    }

    private static save(info: StationConfig) {
        return AsyncStorage.setItem(
            STATION_CONFIG,
            JSON.stringify(info)
        );
    }
}
