import { GlobalSettings } from '@pos/shared/models';

export type ScaleBarcodePriceFormat =
    | 'LEGACY_4_DIGIT_PRICE'
    | 'EAN13_02_4_PLU_5_PRICE';

export type GlobalSettingsDTO = {
    id: string;
    enforceSalesBasedOnInventory: boolean;
    scaleBarcodePriceFormat?: ScaleBarcodePriceFormat;
    timezone?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

const normalizeScaleBarcodePriceFormat = (
    value?: string | null
): ScaleBarcodePriceFormat =>
    value === 'EAN13_02_4_PLU_5_PRICE' ||
    value === 'EAN13_02_5_PLU_5_PRICE'
        ? 'EAN13_02_4_PLU_5_PRICE'
        : 'LEGACY_4_DIGIT_PRICE';

export class GlobalSettingsEntityMapper {
    static from(p?: GlobalSettings): GlobalSettingsDTO | null {
        if (!p) return null;

        return {
            id: p.id,
            enforceSalesBasedOnInventory: p.enforceSalesBasedOnInventory,
            scaleBarcodePriceFormat: normalizeScaleBarcodePriceFormat(
                p.scaleBarcodePriceFormat
            ),
            timezone: p.timezone,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }
    }
}
