import { Category } from '@pos/shared/models';
import { AssetsService } from '@pos/shared/utils';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { CategoryEntity } from './category.entity';
import { categoriesActions } from './slices/categories.slice';
import { stampTenant } from '@pos/auth/data-access';

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

export class CategoryService {
    static async save(dispatch: Dispatch<any>, category: CategoryEntity) {
        if (!category.id) {
            const cat = new Category(
                stampTenant({
                    ...category,
                    discountable: category.discountable ?? true,
                    discountPolicyMode: category.discountPolicyMode || 'DEFAULT',
                }) as never
            );
            const saved = await DataStore.save(cat);
            category.id = saved.id;
            return dispatch(categoriesActions.add(category));
        }
        
        const cat = await DataStore.query(Category, category.id);

        if (!cat) {
            return;
        }

        await DataStore.save(
            Category.copyOf(cat, updated => {
                updated.code = category.code;
                updated.color = category.color;
                updated.description = category.description;
                updated.name = category.name;
                updated.picture = category.picture;
                updated.discountable = category.discountable ?? true;
                updated.discountPolicyMode = category.discountPolicyMode || 'DEFAULT';
            })
        );
        
        return dispatch(categoriesActions.update({ id: category.id, changes: category }));
    }

    static getAll() {
        return DataStore.query(Category).then((items) =>
            items.filter((item) => isNotDeleted(item as { _deleted?: boolean | null }))
        );
    }

    static async delete(id: string) {
        const item = await DataStore.query(Category, id);
        if (!item)
            return console.error(`Cateogry Id: ${id} not found`);
        
        if (item.picture)
            AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }
}
