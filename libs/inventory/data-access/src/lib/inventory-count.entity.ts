import { InventoryCount } from '@pos/shared/models';

export type InventoryCountDTO = {
    id?: string;
    comments: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class InventoryCountMapper {
    static fromModel(x: InventoryCount): InventoryCountDTO {
        return {
            id: x.id,
            comments: x.comments,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }
}


