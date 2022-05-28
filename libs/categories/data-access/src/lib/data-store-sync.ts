import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Category } from '@pos/shared/models';
import { categoriesActions } from './slices/categories.slice';
import { CategoryEntityMapper } from './category.entity';

export const syncCategories = (dispatch: Dispatch) => {
    console.log('Syncing categories to the store');
    DataStore.query(Category).then((categories) =>
        dispatch(categoriesActions.setAll(
            categories.map((c) => CategoryEntityMapper.fromCategory(c))
        ))
    );
};
