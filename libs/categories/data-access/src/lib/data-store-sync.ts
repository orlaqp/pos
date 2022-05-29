import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Category } from '@pos/shared/models';
import { categoriesActions } from './slices/categories.slice';
import { CategoryEntityMapper } from './category.entity';

export const syncCategories = (dispatch: Dispatch) => {
    console.log('Syncing categories to the store');
    DataStore.query(Category).then((categories) =>
        updateStore(dispatch, categories)
    );
};

export const subscribeToCategoryChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(Category).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            console.log('Category changes detected');
            updateStore(dispatch, items);
        }
    });
};

const updateStore = (dispatch: Dispatch, items: Category[]) => {
    items.sort((a, b) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;

        return 0;
    });
    dispatch(
        categoriesActions.setAll(
            items.map((i) => CategoryEntityMapper.fromCategory(i))
        )
    );
};
