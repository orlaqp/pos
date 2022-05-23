
export type InventoryEntity = {
    id?: string;
    
    // TODO: Add entity properties here

    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class InventoryEntityMapper {
    static fromModel(x: Inventory): InventoryEntity {
        return {
            id: x.id,
            
            // TODO: Add the rest of the properties here

            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }
}


