import React from 'react';
import CategoryList from '../category-list/category-list';
import CategoryForm from '../category-form/category-form';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation, withCenteredPage, withHorizontallyCenteredPage, withPage } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

/* eslint-disable-next-line */

export function Categories() {
  const styles = useStyles();
  
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Category List"  component={CategoryList} />
        <Stack.Screen name="Category Form" component={CategoryForm} />
    </StackNavigation>
  );
}

const useStyles = () => {
  const theme = useTheme();
  const sharedStyles = useSharedStyles();

  return {
    ...sharedStyles,
    ...StyleSheet.create({
      navHeader: {
        backgroundColor: theme.theme.colors.background,
        color: theme.theme.colors.grey3,
      },
      headerTitle: {
        color: theme.theme.colors.grey3,
      },
    }),
  };
};

export default Categories;
