import { AssetsService } from './../../../../shared/ui-native/src/lib/components/ui-file-upload/assets.service';
import { Category } from '@pos/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { categoriesActions, CategoryEntity } from './slices/categories.slice';

export class CategoryService {
    static async save(dispatch: Dispatch<any>, category: CategoryEntity) {
        const cat = new Category(category);
        await DataStore.save(cat);

        return category.id
            ? dispatch(categoriesActions.update({ id: category.id, changes: category }))
            : dispatch(categoriesActions.add(cat));
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
