import { InventoryCount, InventoryCountLine } from '@pos/shared/models';

export type InventoryCountLineDTO = {
    id?: string;
    productId: string;
    productName: string;
    unitOfMeasure: string;
    current: number;
    newCount: number;
    comments: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    inventoryCountLineInventoryCountId: string | null | undefined;
};

export class InventoryCountLineMapper {
    static fromModel(x: InventoryCountLine): InventoryCountLineDTO {
        return {
            id: x.id,
            productId: x.productId,
            productName: x.productName,
            unitOfMeasure: x.unitOfMeasure,
            current: x.current,
            newCount: x.newCount,
            comments: x.comments,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
            inventoryCountLineInventoryCountId: x.inventoryCountLineInventoryCountId,
        };
    }
}


