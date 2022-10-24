import { GlobalSettings } from '@pos/shared/models';
import { DataStore } from 'aws-amplify';
import { GlobalSettingsDTO } from './../global-settings.dto';
export class GlobalSettingsService {

    static async updateSettings(newSettings: GlobalSettingsDTO) {
        const settingList = await DataStore.query(GlobalSettings);
        const settings = settingList[0];

        if (settings) 
            return DataStore.save(
                GlobalSettings.copyOf(settings, (updated) => {
                    updated.enforceSalesBasedOnInventory = newSettings.enforceSalesBasedOnInventory;
                })
            );

        return DataStore.save(new GlobalSettings({
            enforceSalesBasedOnInventory: newSettings.enforceSalesBasedOnInventory || false
        }));
    }

}