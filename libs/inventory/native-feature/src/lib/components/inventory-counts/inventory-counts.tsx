
import React from 'react';

import InventoryCountList from './inventory-count-list';
import InventoryCountForm from './inventory-count-form'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function Inventories() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Inventory List"  component={InventoryCountList} />
        <Stack.Screen name="Inventory Form" component={InventoryCountForm} />
    </StackNavigation>
  );
}

export default Inventories;
