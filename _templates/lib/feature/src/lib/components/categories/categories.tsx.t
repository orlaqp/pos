---
to: <%= h.components(name) %>/<%= h.pluralParamCase(name) %>/<%= h.pluralParamCase(name) %>.tsx
---
<%
singularCapitalized = h.singularCapitalized(name)
paramCase = h.paramCase(name)
%>
import React from 'react';

import <%= singularCapitalized %>List from '../<%= paramCase %>-list/<%= paramCase %>-list';
import <%= singularCapitalized %>Form from '../<%= paramCase %>-form/<%= paramCase %>-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function <%= h.pluralCapitalized(name) %>() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="<%= singularCapitalized %> List"  component={<%= singularCapitalized %>List} />
        <Stack.Screen name="<%= singularCapitalized %> Form" component={<%= singularCapitalized %>Form} />
    </StackNavigation>
  );
}

export default <%= h.pluralCapitalized(name) %>;
