import { Category } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { CategoryEntityMapper } from '../category.entity';
import { categoriesActions } from './categories.slice';

export const observeCategoryChanges = (dispatch: Dispatch) => {
    DataStore.observeQuery(Category).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            items.sort((a, b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;

                return 0;
            })
            dispatch(categoriesActions.setAll(
                items
                    .map(i => CategoryEntityMapper.fromCategory(i))
            ));
        }
    });
}