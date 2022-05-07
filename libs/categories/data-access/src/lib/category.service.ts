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
}
