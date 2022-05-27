
import React from 'react';

import InventoryReceiveList from './inventory-receive-list';
import InventoryReceiveForm from './inventory-receive-form'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function InventoryReceives() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Inventory Receive List"  component={InventoryReceiveList} />
        <Stack.Screen name="Inventory Receive Form" component={InventoryReceiveForm} />
    </StackNavigation>
  );
}

export default InventoryReceives;
