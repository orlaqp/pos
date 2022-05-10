---
to: <%= h.components(name) %>/<%= h.plural(name) %>/<%= h.plural(name) %>.tsx
---
<%
plural = h.inflection.pluralize(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React from 'react';

import <%= singularCapitalized %>List from '../<%= name %>-list/<%= name %>-list';
import <%= singularCapitalized %>Form from '../<%= name %>-form/<%= name %>-form';
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
