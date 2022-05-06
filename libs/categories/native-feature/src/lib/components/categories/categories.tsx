import React from 'react';
import { useSharedStyles } from '@pos/theme/native';
import { Button, FAB, useTheme } from '@rneui/themed';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '@rneui/base';
import { Category } from '@pos/models';
import { ScrollView } from 'react-native-gesture-handler';

const categories: Category[] = [
  new Category({
    code: '1',
    color: '#2962FF',
    name: 'Beverages',
    description: 'Beverages, soft drinks, Coca Cola',
  }),
  new Category({
    code: '2',
    color: '#AA00FF',
    name: 'Bread',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  }),
  new Category({
    code: '3',
    color: '#D32F2F',
    name: 'Meat',
    description:
      'officia adipisci a recusandae assumenda inventore quidem sapiente molestiae. Cum, accusamus.',
  }),
  new Category({
    code: '4',
    color: '#F5F5F5',
    name: 'Dairy',
    description:
      'Veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo',
  }),
  new Category({
    code: '5',
    color: '#4DD0E1',
    name: 'Canned',
    description:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  }),
  new Category({
    code: '1',
    color: '#2962FF',
    name: 'Beverages',
    description: 'Beverages, soft drinks, Coca Cola',
  }),
  new Category({
    code: '2',
    color: '#AA00FF',
    name: 'Bread',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  }),
  new Category({
    code: '3',
    color: '#D32F2F',
    name: 'Meat',
    description:
      'officia adipisci a recusandae assumenda inventore quidem sapiente molestiae. Cum, accusamus.',
  }),
  new Category({
    code: '4',
    color: '#F5F5F5',
    name: 'Dairy',
    description:
      'Veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo',
  }),
  new Category({
    code: '5',
    color: '#4DD0E1',
    name: 'Canned',
    description:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  }),
  new Category({
    code: '1',
    color: '#2962FF',
    name: 'Beverages',
    description: 'Beverages, soft drinks, Coca Cola',
  }),
  new Category({
    code: '2',
    color: '#AA00FF',
    name: 'Bread',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  }),
  new Category({
    code: '3',
    color: '#D32F2F',
    name: 'Meat',
    description:
      'officia adipisci a recusandae assumenda inventore quidem sapiente molestiae. Cum, accusamus.',
  }),
  new Category({
    code: '4',
    color: '#F5F5F5',
    name: 'Dairy',
    description:
      'Veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo',
  }),
  new Category({
    code: '5',
    color: '#4DD0E1',
    name: 'Canned',
    description:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  }),
];

/* eslint-disable-next-line */
export interface CategoriesProps {}

export function Categories(props: CategoriesProps) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.detailsPage}>
      <View style={styles.header}>
        <View style={{ flex: 5 }}>
          <Input
            placeholder="type to search ..."
            containerStyle={{
              backgroundColor: theme.theme.colors.searchBg,
              borderRadius: 20,
            }}
            inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 10 }}
            inputStyle={{ color: theme.theme.colors.grey1 }}
            rightIcon={{
              name: 'magnify',
              type: 'material-community',
              color: theme.theme.colors.grey2,
            }}
            renderErrorMessage={false}
          />
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}>
          <FAB
            icon={{ name: 'add', color: 'white' }}
            color={theme.theme.colors.primary}
          />
        </View>
      </View>
      <View style={styles.content}>
        <ScrollView>
          {categories?.map((c) => (
            <View style={styles.dataRow}>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: c.color!,
                  }}
                />
              </View>
              <View style={{ flex: 5 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.description}>{c.description}</Text>
              </View>
              <View
                style={{
                  flex: 2,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  type="clear"
                  title="Edit"
                  icon={{ name: 'pencil-outline', type: 'material-community' }}
                />
                <Button
                  type="clear"
                  icon={{
                    name: 'trash-can',
                    type: 'material-community',
                    color: theme.theme.colors.error,
                  }}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const useStyles = () => {
  const theme = useTheme();
  const sharedStyles = useSharedStyles();

  return {
    ...sharedStyles,
    ...StyleSheet.create({
      header: {
        margin: 10,
        flexDirection: 'row',
        justifyContent: 'center',
      },
      content: {
        padding: 20,
      },
      columnHeader: {
        color: theme.theme.colors.grey3,
      },
      dataRow: {
        ...sharedStyles.row,
        padding: 20,
        backgroundColor: `${theme.theme.colors.searchBg}44`,
        borderRadius: 10,
        marginBottom: 10,
      },
      name: {
        fontSize: 18,
        color: theme.theme.colors.grey0,
        marginBottom: 5,
      },
      description: {
        fontSize: 14,
        color: theme.theme.colors.grey3,
      },
    }),
  };
};

export default Categories;
