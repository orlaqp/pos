import React from 'react';
import { useSharedStyles } from '@pos/theme/native';
import { Button, FAB, useTheme } from '@rneui/themed';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Input } from '@rneui/base';
import { Category } from '@pos/models';
import { ScrollView } from 'react-native-gesture-handler';
import { UIEmptyState, UISpinner } from '@pos/shared/ui-native';
import { useSelector } from 'react-redux';
import { RootState } from '@pos/store';

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

export interface TableRowProps {
  item: Category;
}

export function TableRow({ item }: TableRowProps) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.dataRow}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: item.color!,
          }}
        />
      </View>
      <View style={{ flex: 5 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
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
  );
}

/* eslint-disable-next-line */
export interface CategoriesProps {}

export function Categories(props: CategoriesProps) {
  const theme = useTheme();
  const styles = useStyles();
  const loadingStatus = useSelector((state: RootState) => state.categories.loadingStatus);
  const categories = useSelector((state: RootState) => state.categories.entities);


  return (
      <UISpinner size='large' message='Loading categories ...' />
    //   <UIEmptyState
    //     text='It seems that you do not have any categories defined yet. Click below to fix that :-)'
    //     actionText='Add your first!'
    //     action={() => alert('hello')}
    //   />
    // <View style={styles.detailsPage}>
    //   <View style={styles.header}>
    //     <View style={{ flex: 5 }}>
    //       <Input
    //         placeholder="type to search ..."
    //         containerStyle={{
    //           backgroundColor: theme.theme.colors.searchBg,
    //           borderRadius: 20,
    //         }}
    //         inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 10 }}
    //         inputStyle={{ color: theme.theme.colors.grey1 }}
    //         rightIcon={{
    //           name: 'magnify',
    //           type: 'material-community',
    //           color: theme.theme.colors.grey2,
    //         }}
    //         renderErrorMessage={false}
    //       />
    //     </View>
    //     <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}>
    //       <FAB
    //         icon={{ name: 'add', color: 'white' }}
    //         color={theme.theme.colors.primary}
    //       />
    //     </View>
    //   </View>
    //   <View style={styles.content}>
    //     <ScrollView>
    //         <FlatList data={categories} renderItem={({ item }) => (
    //             <TableRow item={item} />
    //         )} />
    //     </ScrollView>
    //   </View>
    // </View>
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
