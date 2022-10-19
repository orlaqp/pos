import { GlobalSettings } from '@pos/shared/models';
import { DataStore } from 'aws-amplify';
import { GlobalSettingsDTO } from './../global-settings.dto';
export class GlobalSettingsService {

    static async updateSettings(newSettings: GlobalSettingsDTO) {
        const settingList = await DataStore.query(GlobalSettings);
        
        return DataStore.save(
            GlobalSettings.copyOf(settingList[0], (updated) => {
                updated.enforceSalesBasedOnInventory = newSettings.enforceSalesBasedOnInventory;
            })
        );
    }

}