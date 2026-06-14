import { GlobalSettings } from '@pos/shared/models';

export type GlobalSettingsDTO = {
    id: string;
    enforceSalesBasedOnInventory: boolean;
    taxValue: number;
    creditCardSurchargePercent: number;
    timezone?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export class GlobalSettingsEntityMapper {
    static from(p?: GlobalSettings): GlobalSettingsDTO | null {
        if (!p) return null;

        return {
            id: p.id,
            enforceSalesBasedOnInventory: p.enforceSalesBasedOnInventory,
            taxValue: p.taxValue ?? 0,
            creditCardSurchargePercent:
                (p as any).creditCardSurchargePercent ?? 0,
            timezone: p.timezone,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }
    }
}
