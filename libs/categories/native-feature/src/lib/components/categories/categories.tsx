import React from 'react';

import CategoryList from '../category-list/category-list';
import CategoryForm from '../category-form/category-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';
import { RouteProp } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export interface CategoriesRouteParams {
    initialRouteName?: 'Category List' | 'Category Form';
}

export interface CategoriesProps {
    route?: RouteProp<Record<string, CategoriesRouteParams | undefined>, string>;
}

export function Categories({ route }: CategoriesProps) {
    const initialRouteName = route?.params?.initialRouteName || 'Category List';

    return (
        <StackNavigation Stack={Stack} initialRouteName={initialRouteName}>
            <Stack.Screen name="Category List" component={CategoryList} />
            <Stack.Screen name="Category Form" component={CategoryForm} />
        </StackNavigation>
    );
}

export default Categories;
