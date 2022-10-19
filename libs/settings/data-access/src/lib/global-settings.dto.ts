import { GlobalSettings } from '@pos/shared/models';

export type GlobalSettingsDTO = {
    id: string;
    enforceSalesBasedOnInventory: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export class GlobalSettingsEntityMapper {
    static from(p: GlobalSettings): GlobalSettingsDTO {
        return {
            id: p.id,
            enforceSalesBasedOnInventory: p.enforceSalesBasedOnInventory,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }
    }
}