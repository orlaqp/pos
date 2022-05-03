import { Category } from '@pos/models';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const categories: Category[] = [
  new Category({ code: '1', color: '#2962FF', name: 'Beverages' }),
  new Category({ code: '2', color: '#AA00FF', name: 'Bread' }),
  new Category({ code: '3', color: '#D32F2F', name: 'Meat' }),
  new Category({ code: '4', color: '#F5F5F5', name: 'Dairy' }),
  new Category({ code: '5', color: '#4DD0E1', name: 'Canned' }),
  new Category({ code: '1', color: '#2962FF', name: 'Beverages' }),
  new Category({ code: '2', color: '#AA00FF', name: 'Bread' }),
  new Category({ code: '3', color: '#D32F2F', name: 'Meat' }),
  new Category({ code: '4', color: '#F5F5F5', name: 'Dairy' }),
  new Category({ code: '5', color: '#4DD0E1', name: 'Canned' }),
  new Category({ code: '2', color: '#AA00FF', name: 'Bread' }),
  new Category({ code: '3', color: '#D32F2F', name: 'Meat' }),
  new Category({ code: '4', color: '#F5F5F5', name: 'Dairy' }),
  new Category({ code: '5', color: '#4DD0E1', name: 'Canned' }),
  new Category({ code: '2', color: '#AA00FF', name: 'Bread' }),
  new Category({ code: '3', color: '#D32F2F', name: 'Meat' }),
  new Category({ code: '4', color: '#F5F5F5', name: 'Dairy' }),
  new Category({ code: '5', color: '#4DD0E1', name: 'Canned' }),
];

/* eslint-disable-next-line */
export interface CategorySelectionProps {}

export function CategorySelection(props: CategorySelectionProps) {
  const theme = useTheme();
  const styles = useStyles();
  return (
      
    <ScrollView horizontal={true}>
      {categories.map((c) => (
        <TouchableOpacity style={styles.container}>
          <View style={styles.centered}>
            <View style={[styles.categoryBtn, { backgroundColor: c.color }]} />
            <Text style={{ color: theme.theme.colors.black, marginBottom: 25 }}>
              {c.name}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const useStyles = () => {
  const theme = useTheme();
  const sharedStyles = useSharedStyles();

  return {
    ...sharedStyles,
    ...StyleSheet.create({
      container: {
        marginRight: 20,
      },
      categoryBtn: {
        width: 80,
        height: 80,
        borderRadius: 4,
      },
    }),
  };
};

export default CategorySelection;
