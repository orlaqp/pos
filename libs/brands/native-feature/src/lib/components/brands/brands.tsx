
import React from 'react';

import BrandList from '../brand-list/brand-list';
import BrandForm from '../brand-form/brand-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function Brands() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Brand List"  component={BrandList} />
        <Stack.Screen name="Brand Form" component={BrandForm} />
    </StackNavigation>
  );
}

export default Brands;
