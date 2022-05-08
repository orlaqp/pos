import { Category } from '@pos/models';
import { DataStore } from 'aws-amplify';
import { CategoryEntity } from './slices/categories.slice';



export class CategoryService {
    static save(category: CategoryEntity) {
        const cat = new Category(category);
        return DataStore.save(cat);
    }

    static getAll() {
        return DataStore.query(Category);
    }

    static async delete(id: string) {
        const item = await DataStore.query(Category, id);
        if (!item) {
            return console.error(`Cateogry Id: ${id} not found`);
        }

        return DataStore.delete(item);
    }
}
