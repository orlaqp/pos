import React, { useEffect } from 'react';
import { fetchCategories } from '@pos/categories/data-access';
import { Category } from '@pos/models';
import { UIEmptyState, UISearchInput, UISpinner } from '@pos/shared/ui-native';
import { RootState } from '@pos/store';
import { useSharedStyles } from '@pos/theme/native';
import { Button, FAB, useTheme } from '@rneui/themed';

import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface TableRowProps {
    item: Category;
}

export function CategoryRow({ item }: TableRowProps) {
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
                    icon={{
                        name: 'pencil-outline',
                        type: 'material-community',
                    }}
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
export interface CategoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function CategoryList({ navigation }: CategoryListProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();
    const loadingStatus = useSelector(
        (state: RootState) => state.categories.loadingStatus
    );
    const categories = useSelector(
        (state: RootState) => state.categories.entities
    );

    useEffect(() => {
        if (loadingStatus === 'not loaded') dispatch(fetchCategories());
    }, [loadingStatus, dispatch]);

    if (loadingStatus === 'loading' || loadingStatus === 'not loaded')
        return <UISpinner size="large" message="Loading categories ..." />;

    if (loadingStatus === 'loaded' && !Object.keys(categories).length)
        return (
            <UIEmptyState
                text="It seems that you do not have any categories defined yet. Click below to fix that :-)"
                actionText="Add your first!"
                action={() => navigation.navigate('Category Form')}
            />
        );

    return (
        <View style={styles.detailsPage}>
            <View style={styles.header}>
                <View style={{ flex: 5 }}>
                    <UISearchInput />
                </View>
                <View
                    style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}
                >
                    <FAB
                        icon={{ name: 'add', color: 'white' }}
                        color={theme.theme.colors.primary}
                    />
                </View>
            </View>
            <View style={styles.content}>
                {/* <ScrollView> */}
                <FlatList
                    data={Object.keys(categories)}
                    renderItem={({ item }) => (
                        <CategoryRow item={categories[item]!} />
                    )}
                />
                {/* </ScrollView> */}
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

export default CategoryList;
