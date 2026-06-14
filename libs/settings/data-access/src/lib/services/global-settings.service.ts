/* eslint-disable @nx/enforce-module-boundaries */
import { GlobalSettings } from '@pos/shared/models';
import { DataStore } from '@pos/shared/amplify';
import { GlobalSettingsDTO, GlobalSettingsEntityMapper } from './../global-settings.dto';
import { stampTenant } from '@pos/auth/data-access';

const normalizePercent = (value: number) =>
    Number.isFinite(value) ? value : 0;

export class GlobalSettingsService {

    static async fetch() {
        try {
            const settingList = await DataStore.query(GlobalSettings);
            return GlobalSettingsEntityMapper.from(settingList[0]);
        } catch (error) {
            console.warn('GlobalSettingsService.fetch() failed, returning empty settings', error);
            return null;
        }
    }

    static async updateSettings(newSettings: GlobalSettingsDTO) {
        const settingList = await DataStore.query(GlobalSettings);
        const settings = settingList[0];

        if (settings) 
            return DataStore.save(
                GlobalSettings.copyOf(settings, (updated) => {
                    updated.enforceSalesBasedOnInventory = newSettings.enforceSalesBasedOnInventory;
                    updated.taxValue = normalizePercent(newSettings.taxValue);
                    updated.creditCardSurchargePercent = normalizePercent(
                        newSettings.creditCardSurchargePercent
                    );
                    updated.timezone = newSettings.timezone || settings.timezone || 'America/New_York';
                })
            );

        return DataStore.save(new GlobalSettings(stampTenant({
            enforceSalesBasedOnInventory: newSettings.enforceSalesBasedOnInventory || false,
            taxValue: normalizePercent(newSettings.taxValue),
            creditCardSurchargePercent: normalizePercent(
                newSettings.creditCardSurchargePercent
            ),
            timezone: newSettings.timezone || 'America/New_York',
        }) as never));
    }

}
