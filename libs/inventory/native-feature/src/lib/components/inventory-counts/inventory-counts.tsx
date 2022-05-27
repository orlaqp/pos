
import React from 'react';

import InventoryCountList from './inventory-count-list';
import InventoryCountForm from './inventory-count-form'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function InventoryCounts() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Inventory Count List"  component={InventoryCountList} />
        <Stack.Screen name="Inventory Count Form" component={InventoryCountForm} />
    </StackNavigation>
  );
}

export default InventoryCounts;
