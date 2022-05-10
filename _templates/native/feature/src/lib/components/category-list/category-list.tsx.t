---
to: <%= h.components(name) %>/<%= name %>-list/<%= name %>-list.tsx
---
<%
plural = h.inflection.pluralize(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React from 'react';
import { <%= plural %>Actions, fetch<%= h.pluralCapitalized(name) %>, selectFilteredList, selectIsEmpty, selectLoadingStatus } from '@pos/<%= plural %>/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import <%= singularCapitalized %>Item from '../<%= name %>-item/<%= name %>-item';

export interface <%= singularCapitalized %>ListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function <%= singularCapitalized %>List({ navigation }: <%= singularCapitalized %>ListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: <%= singularCapitalized %>Item,
        formNavName: '<%= singularCapitalized %> Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: <%= plural %>Actions.clearSelection,
        filterAction: <%= plural %>Actions.filter,
        fetchItemsAction: fetch<%= h.pluralCapitalized(name) %>,
    }

    return <UIGenericItemList {...props} />
};

export default <%= singularCapitalized %>List;
