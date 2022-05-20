import React, { useEffect } from 'react';
import { UIEmptyState, UISearchInput, UISpinner } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, FAB, useTheme } from '@rneui/themed';

import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Dictionary } from '@reduxjs/toolkit';

export interface ItemComponentProps<TEntityType> {
    item: TEntityType;
    navigation: NativeStackNavigationProp<any>;
}

export interface ItemListProps<TState, TEntityType> {
    // properties
    formNavName: string;
    navigation: NativeStackNavigationProp<any>;
    // selectors
    isEmptySelector: (state: TState) => boolean;
    loadingStatusSelector: (state: TState) => unknown;
    filteredListSelector: (state: TState) => Dictionary<unknown> | undefined;
    // actions
    clearSelectionAction: () => unknown;
    filterAction: (query: string) => unknown;
    fetchItemsAction?: () => unknown;

    ItemComponent: (props: ItemComponentProps<TEntityType>) => JSX.Element;
    goBackEnable?: boolean;
}

export function UIGenericItemList({
    formNavName,
    navigation,
    isEmptySelector,
    loadingStatusSelector,
    clearSelectionAction,
    filterAction,
    fetchItemsAction,
    filteredListSelector,
    ItemComponent,
    goBackEnable,
}: ItemListProps<unknown, unknown>) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();

    const isEmpty = useSelector(isEmptySelector);
    const loadingStatus = useSelector(loadingStatusSelector);
    const items = useSelector(filteredListSelector);

    const createNew = () => {
        dispatch(clearSelectionAction());
        navigation.navigate(formNavName);
    };

    const filterList = (query: string) => {
        dispatch(filterAction(query));
    };

    useEffect(() => {
        if (fetchItemsAction && loadingStatus === 'not loaded')
            dispatch(fetchItemsAction());
    }, [loadingStatus, dispatch, fetchItemsAction]);

    if (loadingStatus === 'loading' || loadingStatus === 'not loaded')
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UISpinner size="small" message="Loading..." />
            </View>
        );

    if (loadingStatus === 'loaded' && isEmpty)
        return (
            <UIEmptyState
                text="This is looking kind of empty here. Click below to fix that :-)"
                actionText="Add your first!"
                action={() => navigation.navigate(formNavName)}
            />
        );

    
    const confirmGoBack = () => {
        Alert.alert('Are you sure?', 'Press yes to confirm', [
            { text: 'No' },
            { text: 'Yes', onPress: () => navigation.goBack() },
        ]);
    };

    return (
        <View style={styles.detailsPage}>
            <View style={[styles.header, { alignItems: 'center' }]}>
                {goBackEnable && (
                    <View style={{ marginRight: 20 }}>
                        <Button
                            icon={{
                                name: 'arrow-left',
                                type: 'material-community',
                                color: styles.primaryText.color,
                            }}
                            onPress={confirmGoBack}
                        />
                    </View>
                )}
                <View style={{ flex: 5 }}>
                    <UISearchInput
                        debounceTime={300}
                        onTextChanged={filterList}
                    />
                </View>
                <Button
                    type="clear"
                    icon={{
                        name: 'refresh',
                        type: 'material-community',
                        color: theme.theme.colors.grey2,
                    }}
                    style={{ top: 4, left: 15 }}
                    onPress={() =>
                        fetchItemsAction && dispatch(fetchItemsAction())
                    }
                />
                <View
                    style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}
                >
                    <FAB
                        icon={{ name: 'add', color: 'white' }}
                        color={theme.theme.colors.primary}
                        onPress={createNew}
                    />
                </View>
            </View>
            <View style={styles.content}>
                {items && (
                    <FlatList
                        data={Object.keys(items)}
                        renderItem={({ item }) => (
                            <ItemComponent
                                navigation={navigation}
                                item={items[item]!}
                            />
                        )}
                    />
                )}
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
        }),
    };
};

export default UIGenericItemList;
