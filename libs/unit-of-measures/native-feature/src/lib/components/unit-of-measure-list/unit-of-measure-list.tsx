import React, { useEffect } from 'react';
import {
    unitOfMeasuresActions,
    fetchUnitOfMeasures,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
    subscribeToUnitOfMeasureChanges,
} from '@pos/unit-of-measures/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import UnitOfMeasureItem from '../unit-of-measure-item/unit-of-measure-item';
import { useDispatch } from 'react-redux';

export interface UnitOfMeasureListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function UnitOfMeasureList({ navigation }: UnitOfMeasureListProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        const sub = subscribeToUnitOfMeasureChanges(dispatch);
        return () => {
            console.log('Closing unit of measures subscription');
            sub.unsubscribe();
        };
    }, [dispatch]);

    const props: ItemListProps<any, any> = {
        ItemComponent: UnitOfMeasureItem,
        formNavName: 'UnitOfMeasure Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: unitOfMeasuresActions.clearSelection,
        filterAction: unitOfMeasuresActions.filter,
        fetchItemsAction: fetchUnitOfMeasures,
    };

    return <UIGenericItemList {...props} />;
}

export default UnitOfMeasureList;
