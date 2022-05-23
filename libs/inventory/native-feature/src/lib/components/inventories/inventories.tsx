
import React from 'react';

import InventoryList from '../inventory-list/inventory-list';
import InventoryForm from '../inventory-form/inventory-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function Inventories() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Inventory List"  component={InventoryList} />
        <Stack.Screen name="Inventory Form" component={InventoryForm} />
    </StackNavigation>
  );
}

export default Inventories;
