/* eslint-disable @nx/enforce-module-boundaries */
import { EmployeeEntity } from '@pos/employees/data-access';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const STATION_CONFIG = 'stationConfig';

export interface StationConfig {
    stationNumber?: string;
    currentDate?: string;
    orderNumber?: number;
}

export class StationService {
    static async getConfig(): Promise<StationConfig> {
        const stationConfigString = await AsyncStorage.getItem(STATION_CONFIG);
        if (!stationConfigString) {
            return {};
        }

        try {
            return JSON.parse(stationConfigString);
        } catch (error) {
            console.error('Invalid station config payload', error);
            return {};
        }
    }

    static async saveStationNo(stationNumber: string) {
        const config = await StationService.getConfig();
        config.stationNumber = stationNumber;
        StationService.saveConfig(config);
    }

    static async isStationNumberSet() {
        const config = await StationService.getConfig();
        return config.stationNumber !== undefined && config.stationNumber !== null;
    }

    static async getNextOrderNumber(employee: EmployeeEntity) {
        const config = await StationService.getConfig();
        const { orderNo, config: nextConfig } = StationService.reserveNextOrderNumber(
            config,
            employee
        );

        await StationService.saveConfig(nextConfig);

        return orderNo;
    }

    static reserveNextOrderNumber(
        config: StationConfig,
        employee: EmployeeEntity
    ) {
        const nextConfig: StationConfig = {
            ...config,
        };
        if (!config.stationNumber) {
            throw new Error(
                'You cannot make sales before configuring the station code'
            );
        }

        if (!employee.code?.trim()) {
            throw new Error(
                'You cannot make sales until the employee code is available'
            );
        }

        const today = moment();
        const orderDateString = today.format('YYMMDD');

        if (
            !nextConfig.currentDate ||
            !nextConfig.orderNumber ||
            nextConfig.currentDate !== orderDateString
        ) {
            nextConfig.currentDate = orderDateString;
            nextConfig.orderNumber = 0;
        }

        nextConfig.orderNumber += 1;

        return {
            orderNo: `${nextConfig.stationNumber}-${employee.code}-${orderDateString}-${nextConfig.orderNumber
                .toString()
                .padStart(4, '0')}`,
            config: nextConfig,
        };
    }

    static saveConfig(info: StationConfig) {
        return AsyncStorage.setItem(
            STATION_CONFIG,
            JSON.stringify(info)
        );
    }
}
