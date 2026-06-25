/* eslint-disable @nx/enforce-module-boundaries */
import { GlobalSettings } from '@pos/shared/models';
import { DataStore } from '@pos/shared/amplify';
import { GlobalSettingsDTO, GlobalSettingsEntityMapper } from './../global-settings.dto';
import { stampTenant } from '@pos/auth/data-access';
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
                    updated.scaleBarcodePriceFormat =
                        newSettings.scaleBarcodePriceFormat ||
                        settings.scaleBarcodePriceFormat ||
                        'LEGACY_4_DIGIT_PRICE';
                    updated.taxValue = Number.isFinite(newSettings.taxValue) ? newSettings.taxValue : 0;
                    updated.timezone = newSettings.timezone || settings.timezone || 'America/New_York';
                })
            );

        return DataStore.save(new GlobalSettings(stampTenant({
            enforceSalesBasedOnInventory: newSettings.enforceSalesBasedOnInventory || false,
            scaleBarcodePriceFormat:
                newSettings.scaleBarcodePriceFormat || 'LEGACY_4_DIGIT_PRICE',
            taxValue: Number.isFinite(newSettings.taxValue) ? newSettings.taxValue : 0,
            timezone: newSettings.timezone || 'America/New_York',
        }) as never));
    }

}
