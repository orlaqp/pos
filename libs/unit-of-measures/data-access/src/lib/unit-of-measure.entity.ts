import { UnitOfMeasure } from '@pos/shared/models';

export const EACH = 'ea';
export const POUND = 'lb';

export type UnitOfMeasureEntity = {
    id?: string;
    name: string;
    description?: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class UnitOfMeasureEntityMapper {
    static fromModel(c: UnitOfMeasure) {
        return {
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }
    }
}