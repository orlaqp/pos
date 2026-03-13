import { InventoryReceiveLine, Product } from '@pos/shared/models';

export type InventoryReceiveLineDTO = {
    id?: string;
    productId: string;
    productName: string;
    unitOfMeasure: string;
    received: number;
    comments: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    inventoryReceiveLineInventoryReceiveId: string | null | undefined;
};

type ReceiveSelectableProduct = Pick<Product, 'id' | 'name' | 'unitOfMeasure'>;

export class InventoryReceiveLineMapper {
    static fromProduct(x: ReceiveSelectableProduct): InventoryReceiveLineDTO {
        return {
            productId: x.id,
            productName: x.name,
            unitOfMeasure: x.unitOfMeasure,
            comments: '',
            received: 0,
            inventoryReceiveLineInventoryReceiveId: '',
        };
    }

    static fromLine(x: InventoryReceiveLine): InventoryReceiveLineDTO {
        return {
            id: x.id,
            productId: x.productId,
            productName: x.productName,
            unitOfMeasure: x.unitOfMeasure,
            received: x.received,
            comments: x.comments,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
            inventoryReceiveLineInventoryReceiveId: x.inventoryReceiveLineInventoryReceiveId,
        };
    }
}

