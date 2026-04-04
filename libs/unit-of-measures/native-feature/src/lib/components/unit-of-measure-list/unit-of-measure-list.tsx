import React, { useEffect } from 'react';
import {
    unitOfMeasuresActions,
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

export const buildUnitOfMeasureListProps = (
    navigation: NativeStackNavigationProp<any>
) =>
    ({
        ItemComponent: UnitOfMeasureItem,
        formNavName: 'UnitOfMeasure Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: unitOfMeasuresActions.clearSelection,
        filterAction: unitOfMeasuresActions.filter,
        fetchItemsAction: undefined,
        emptyTitle: 'No units yet',
        emptySubtitle:
            'Create units of measure before assigning them to products in the catalog.',
        emptyActionText: 'Add unit',
        emptyActionIcon: 'scale-balance',
    } as ItemListProps<any, any>);

export function UnitOfMeasureList({ navigation }: UnitOfMeasureListProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        const sub = subscribeToUnitOfMeasureChanges(dispatch);
        return () => {
            sub.unsubscribe();
        };
    }, [dispatch]);

    const props = buildUnitOfMeasureListProps(navigation);

    return <UIGenericItemList {...props} />;
}

export default UnitOfMeasureList;
