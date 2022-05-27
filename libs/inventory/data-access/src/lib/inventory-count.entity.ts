import { InventoryCount, InventoryCountStatus } from '@pos/shared/models';
import { InventoryCountLineDTO } from './inventory-count-line.entity';

export type InventoryCountDTO = {
    id?: string;
    comments: string | null | undefined;
    status: InventoryCountStatus | keyof typeof InventoryCountStatus;
    lines: InventoryCountLineDTO[];
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class InventoryCountMapper {
    static fromModel(x: InventoryCount, lines: InventoryCountLineDTO[]): InventoryCountDTO {
        return {
            id: x.id,
            comments: x.comments,
            status: x.status,
            lines,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }
}


