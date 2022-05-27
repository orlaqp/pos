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
    static newCount(): InventoryReceiveDTO {
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
            inventoryReceivedLineInventoryReceivedId: x.inventoryReceiveLineInventoryReceivedId,
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
        counts: InventoryReceiveDTO[],
        lines: InventoryReceiveLineDTO[]
    ): InventoryReceiveDTO[] {
        return counts.map((c) => ({
            ...c,
            lines: lines?.filter((l) => l.inventoryReceivedLineInventoryReceivedId === c.id),
        }));
    }
}


