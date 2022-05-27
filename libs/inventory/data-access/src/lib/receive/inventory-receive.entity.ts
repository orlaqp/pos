import { InventoryCountLine, InventoryReceive, InventoryReceiveLine, InventoryReceiveStatus } from '@pos/shared/models';
import { InventoryReceiveLineDTO } from './inventory-receive-line.entity';

export type InventoryReceiveDTO = {
    id?: string;
    comments: string | null | undefined;
    status: InventoryReceiveStatus | keyof typeof InventoryReceiveStatus;
    lines: InventoryReceiveLineDTO[];
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class InventoryReceiveMapper {
    static newReceive(): InventoryReceiveDTO {
        return {
            status: 'IN_PROGRESS',
            comments: 'n/a',
            lines: []
        }
    }

    static fromModel(x: InventoryReceive, lines: InventoryReceiveLineDTO[]): InventoryReceiveDTO {
        return {
            id: x.id,
            comments: x.comments,
            status: x.status,
            lines,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }

    static fromLine(x: InventoryReceiveLine): InventoryReceiveLineDTO {
        return {
            id: x.id,
            inventoryReceiveLineInventoryReceiveId: x.inventoryReceiveLineInventoryReceiveId,
            productId: x.productId,
            productName: x.productName,
            unitOfMeasure: x.unitOfMeasure,
            received: x.received,
            comments: x.comments,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }

    static composeReceiveItems(
        list: InventoryReceiveDTO[],
        lines: InventoryReceiveLineDTO[]
    ): InventoryReceiveDTO[] {
        return list.map((i) => ({
            ...i,
            lines: lines?.filter((l) => l.inventoryReceiveLineInventoryReceiveId === i.id),
        }));
    }
}


