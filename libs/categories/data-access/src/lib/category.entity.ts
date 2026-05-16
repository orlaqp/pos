import { Category } from '@pos/shared/models';

export type CategoryEntity = {
    id?: string,
    name: string,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    discountable?: boolean,
    discountPolicyMode?: string,
    createdAt?: string | null | undefined,
    updatedAt?: string | null | undefined,
};

export class CategoryEntityMapper {
    static fromCategory(c: Category) {
        return {
            id: c.id,
            name: c.name,
            description: c.description,
            code: c.code,
            color: c.color,
            picture: c.picture,
            discountable: c.discountable ?? true,
            discountPolicyMode: c.discountPolicyMode ?? 'DEFAULT',
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }
    }
}
