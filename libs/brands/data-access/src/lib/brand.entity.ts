import { Brand } from '@pos/shared/models';

export type BrandEntity = {
    id?: string;
    name: string;
    description?: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class BrandEntityMapper {
    static fromModel(c: Brand) {
        return {
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }
    }
}