import { InventoryReceiveLine, Product } from '@pos/shared/models';

export type InventoryReceiveLineDTO = {
    id?: string;
    productId: string;
    productName: string;
    unitOfMeasure: string;
    current: number;
    received: number;
    comments: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    inventoryReceiveLineInventoryReceiveId: string | null | undefined;
};

type ReceiveSelectableProduct = Pick<Product, 'id' | 'name' | 'unitOfMeasure' | 'quantity'>;

export class InventoryReceiveLineMapper {
    static fromProduct(x: ReceiveSelectableProduct): InventoryReceiveLineDTO {
        return {
            productId: x.id,
            productName: x.name,
            unitOfMeasure: x.unitOfMeasure,
            current: Number(x.quantity || 0),
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
            current: Number((x as { current?: number | null }).current || 0),
            received: x.received,
            comments: x.comments,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
            inventoryReceiveLineInventoryReceiveId: x.inventoryReceiveLineInventoryReceiveId,
        };
    }
}
