import { Category } from '@pos/shared/models';
import { AssetsService } from '@pos/shared/utils';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { CategoryEntity } from './category.entity';
import { categoriesActions } from './slices/categories.slice';

export class CategoryService {
    static async save(dispatch: Dispatch<any>, category: CategoryEntity) {
        if (!category.id) {
            const cat = new Category(category);
            await DataStore.save(cat);
            return dispatch(categoriesActions.add(category));
        }
        
        const cat = await DataStore.query(Category, category.id);

        if (!cat) {
            return console.log(`It seems that category: ${category.id} has been removed`);
        }

        await DataStore.save(
            Category.copyOf(cat, updated => {
                updated.code = category.code;
                updated.color = category.color;
                updated.description = category.description;
                updated.name = category.name;
                updated.picture = category.picture;
            })
        );
        
        return dispatch(categoriesActions.update({ id: category.id, changes: category }));
    }

    static getAll() {
        return DataStore.query(Category);
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
