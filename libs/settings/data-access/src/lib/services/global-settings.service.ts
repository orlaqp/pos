import { GlobalSettings } from '@pos/shared/models';
import { DataStore } from '@pos/shared/amplify';
import { GlobalSettingsDTO, GlobalSettingsEntityMapper } from './../global-settings.dto';
import { stampTenant } from '@pos/auth/data-access';
export class GlobalSettingsService {

    static async fetch() {
        const settingList = await DataStore.query(GlobalSettings);
        return GlobalSettingsEntityMapper.from(settingList[0]);
    }

    static async updateSettings(newSettings: GlobalSettingsDTO) {
        const settingList = await DataStore.query(GlobalSettings);
        const settings = settingList[0];

        if (settings) 
            return DataStore.save(
                GlobalSettings.copyOf(settings, (updated) => {
                    updated.enforceSalesBasedOnInventory = newSettings.enforceSalesBasedOnInventory;
                })
            );

        return DataStore.save(new GlobalSettings(stampTenant({
            enforceSalesBasedOnInventory: newSettings.enforceSalesBasedOnInventory || false
        }) as never));
    }

}
