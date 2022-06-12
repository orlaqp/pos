import React, { useEffect, useState } from 'react';
import { UIEmptyState, UISearchInput, UISpinner } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, FAB, useTheme } from '@rneui/themed';

import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Dictionary } from '@reduxjs/toolkit';

const PAGE_SIZE = 10;

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
    filteredListSelector: (state: TState) => unknown[] | undefined;
    // actions
    clearSelectionAction: () => unknown;
    filterAction: (query: string) => unknown;
    fetchItemsAction?: () => unknown;

    ItemComponent: (props: ItemComponentProps<TEntityType>) => JSX.Element;
    goBackEnable?: boolean;
    emptyText?: string;
    emptyActionText?: string;
    emptyAction?: () => void;
    emptyActionIcon?: string;
    renderHeader?: () => unknown;
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
    emptyText,
    emptyActionText,
    emptyAction,
    emptyActionIcon,
    renderHeader,
}: ItemListProps<unknown, unknown>) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();

    const isEmpty = useSelector(isEmptySelector);
    const loadingStatus = useSelector(loadingStatusSelector);
    const items = useSelector(filteredListSelector);
    const [visibleItems, setVisibleItems] = useState<unknown[]>();
    const [lastIndex, setLastIndex] = useState<number>(10);

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

    useEffect(() => {
        if (!items) setVisibleItems(undefined);
        setVisibleItems(items?.slice(0, lastIndex));
    }, [items, lastIndex]);

    
    if (loadingStatus === 'loading' || loadingStatus === 'not loaded')
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UISpinner size="small" message="Loading..." />
            </View>
        );

    if (loadingStatus === 'loaded' && isEmpty)
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UIEmptyState
                    text={
                        emptyText ||
                        'This is looking kind of empty here. Click below to fix that :-)'
                    }
                    actionText={emptyActionText || 'Add your first!'}
                    action={() =>
                        emptyAction
                            ? emptyAction()
                            : navigation.navigate(formNavName)
                    }
                    icon={emptyActionIcon}
                />
            </View>
        );

    const confirmGoBack = () => {
        Alert.alert('Are you sure?', 'Press yes to confirm', [
            { text: 'No' },
            { text: 'Yes', onPress: () => navigation.goBack() },
        ]);
    };

    const showMoreItems = () => {
        if (!items) return;

        const totalItems = items?.length;
        const delta = totalItems - lastIndex;

        if (delta > 0) {
            setLastIndex(
                delta > PAGE_SIZE ? lastIndex + PAGE_SIZE : lastIndex + delta
            );
        }
    }

    return (
        <View style={styles.detailsPage}>
            {renderHeader && renderHeader()}
            {!renderHeader && (
                <View style={[styles.header, { alignItems: 'center' }]}>
                    <View style={{ flex: 5 }}>
                        <UISearchInput
                            debounceTime={300}
                            onSubmit={filterList}
                            returnKeyType='search'
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
                        style={{
                            flex: 1,
                            alignItems: 'flex-end',
                            marginRight: 20,
                        }}
                    >
                        <FAB
                            icon={{ name: 'add', color: 'white' }}
                            color={theme.theme.colors.primary}
                            onPress={createNew}
                        />
                    </View>
                </View>
            )}
            <View style={styles.content}>
                {items && (
                    <FlatList
                        data={visibleItems}
                        getItemLayout={(data, index) => (
                            {length: 100, offset: 100 * index, index}
                        )}
                        onEndReachedThreshold={0.2}
                        onEndReached={showMoreItems}
                        renderItem={({ item }) => (
                            <ItemComponent
                                navigation={navigation}
                                item={item}
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
                height: '94%'
            },
            columnHeader: {
                color: theme.theme.colors.grey3,
            },
        }),
    };
};

export default UIGenericItemList;
