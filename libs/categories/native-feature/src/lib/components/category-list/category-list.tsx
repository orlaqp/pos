import React, { useEffect } from 'react';
import { categoriesActions, CategoriesState, CategoryEntity, fetchCategories, selectFilteredList, selectIsEmpty, selectLoadingStatus } from '@pos/categories/data-access';
import { ItemListProps, UIEmptyState, UIGenericItemList, UISearchInput, UISpinner } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, FAB, useTheme } from '@rneui/themed';

import { View, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryItem from '../category-item/category-item';
import { RootState } from '@pos/store';

export interface CategoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function CategoryList({ navigation }: CategoryListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: CategoryItem,
        formNavName: 'Category Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: categoriesActions.clearSelection,
        filterAction: categoriesActions.filter,
        fetchItemsAction: fetchCategories,
    }

    return <UIGenericItemList {...props} />
        
        

     

//     const theme = useTheme();
//     const styles = useStyles();
//     const dispatch = useDispatch();
//     const isEmpty = useSelector(selectIsEmpty);
//     const loadingStatus = useSelector(selectLoadingStatus);
//     const categories = useSelector(selectFilteredList);

//     const createNew = () => {
//         dispatch(categoriesActions.clearSelection());
//         navigation.navigate('Category Form');
//     }

//     const filterList = (query: string) => {
//         dispatch(categoriesActions.filter(query));
//     }

//     useEffect(() => {
//         if (loadingStatus === 'not loaded') dispatch(fetchCategories());
//     }, [loadingStatus, dispatch]);

//     if (loadingStatus === 'loading' || loadingStatus === 'not loaded')
//         return <UISpinner size="large" message="Loading categories ..." />;

//     if (loadingStatus === 'loaded' && isEmpty)
//         return (
//             <UIEmptyState
//                 text="It seems that you do not have any categories defined yet. Click below to fix that :-)"
//                 actionText="Add your first!"
//                 action={() => navigation.navigate('Category Form')}
//             />
//         );

//     return (
//         <View style={styles.detailsPage}>
//             <View style={styles.header}>
//                 <View style={{ flex: 5 }}>
//                     <UISearchInput onChange={filterList} />
//                 </View>
//                 <Button
//                     type="clear"
//                     icon={{
//                         name: 'refresh',
//                         type: 'material-community',
//                         color: theme.theme.colors.grey2,
//                     }}
//                     style={{ top: 4, left: 15 }}
//                     onPress={() => dispatch(fetchCategories())}
//                 />
//                 <View
//                     style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}
//                 >
//                     <FAB
//                         icon={{ name: 'add', color: 'white' }}
//                         color={theme.theme.colors.primary}
//                         onPress={createNew}
//                     />
//                 </View>
//             </View>
//             <View style={styles.content}>
//                 { categories && 
//                 <FlatList
//                     data={Object.keys(categories)}
//                     renderItem={({ item }) => (
//                         <CategoryItem
//                             navigation={navigation}
//                             item={categories[item]!}
//                         />
//                     )}
//                 />
//                 }
//             </View>
//         </View>
//     );
// }

// const useStyles = () => {
//     const theme = useTheme();
//     const sharedStyles = useSharedStyles();

//     return {
//         ...sharedStyles,
//         ...StyleSheet.create({
//             header: {
//                 margin: 10,
//                 flexDirection: 'row',
//                 justifyContent: 'center',
//             },
//             content: {
//                 padding: 20,
//             },
//             columnHeader: {
//                 color: theme.theme.colors.grey3,
//             },
//         }),
//     };
};

export default CategoryList;
