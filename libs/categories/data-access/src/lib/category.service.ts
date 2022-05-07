import { Category } from '@pos/models';
import { DataStore } from 'aws-amplify';



export class CategoryService {
    static save(category: Category) {
        return DataStore.save(category);
    }

    static getAll() {
        return DataStore.query(Category);
    }
}
