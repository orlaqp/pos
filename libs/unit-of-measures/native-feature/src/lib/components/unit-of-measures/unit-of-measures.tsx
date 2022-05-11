
import React from 'react';

import UnitOfMeasureList from '../unit-of-measure-list/unit-of-measure-list';
import UnitOfMeasureForm from '../unit-of-measure-form/unit-of-measure-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function UnitOfMeasures() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="UnitOfMeasure List"  component={UnitOfMeasureList} />
        <Stack.Screen name="UnitOfMeasure Form" component={UnitOfMeasureForm} />
    </StackNavigation>
  );
}

export default UnitOfMeasures;
