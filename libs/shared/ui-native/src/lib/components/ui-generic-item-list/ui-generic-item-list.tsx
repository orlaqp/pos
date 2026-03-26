import React, { useEffect, useMemo, useState } from 'react';
import UIEmptyState from '../ui-empty-state/ui-empty-state';
import UISpinner from '../ui-spinner/ui-spinner';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Text,
} from 'react-native';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '@pos/store';

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
    filteredListSelector: (state: TState) => TEntityType[] | undefined;
    // actions
    clearSelectionAction: () => any;
    filterAction: (query: string) => any;
    fetchItemsAction?: () => any;

    ItemComponent: React.ComponentType<ItemComponentProps<TEntityType>>;
    goBackEnable?: boolean;
    emptyTitle?: string;
    emptySubtitle?: string;
    emptyActionText?: string;
    emptyAction?: () => void;
    emptyActionIcon?: string;
    renderHeader?: () => React.ReactNode;
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
    emptyTitle,
    emptySubtitle,
    emptyActionText,
    emptyAction,
    emptyActionIcon,
    renderHeader,
}: ItemListProps<unknown, any>) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useAppDispatch();

    const isEmpty = useSelector(isEmptySelector);
    const loadingStatus = useSelector(loadingStatusSelector);
    const items = useSelector(filteredListSelector);
    const [lastIndex, setLastIndex] = useState<number>(10);
    const [query, setQuery] = useState<string>('');
    const visibleItems = useMemo(() => items?.slice(0, lastIndex), [items, lastIndex]);

    const createNew = () => {
        dispatch(clearSelectionAction());
        navigation.navigate(formNavName);
    };

    const filterList = (query: string) => {
        dispatch(filterAction(query));
    };

    const submitQuery = (value?: string) => {
        const nextQuery = value ?? query;
        setQuery(nextQuery);
        filterList(nextQuery);
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
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UIEmptyState
                    title={emptyTitle || 'Nothing here yet'}
                    subtitle={
                        emptySubtitle ||
                        'Create the first record to start building this catalog section.'
                    }
                    actions={[
                        {
                            title: emptyActionText || 'Add item',
                            onPress: () =>
                                emptyAction
                                    ? emptyAction()
                                    : navigation.navigate(formNavName),
                            type: 'solid',
                            icon: emptyActionIcon
                                ? {
                                      name: emptyActionIcon,
                                      type: 'material-community',
                                      color: '#ffffff',
                                      size: 18,
                                  }
                                : undefined,
                        },
                    ]}
                />
            </View>
        );

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
                <View style={styles.headerCard}>
                <View style={[styles.header, { alignItems: 'center' }]}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            testID="ui-generic-item-list-search-input"
                            value={query}
                            placeholder="Search..."
                            placeholderTextColor={theme.theme.colors.grey2}
                            style={styles.searchInput}
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="search"
                            onChangeText={(value) => setQuery(value)}
                            onSubmitEditing={(e) => {
                                submitQuery(e.nativeEvent.text);
                            }}
                            onEndEditing={(e) => submitQuery(e.nativeEvent.text)}
                        />
                    </View>
                    <TouchableOpacity
                        testID="ui-generic-item-list-refresh-button"
                        style={styles.refreshButton}
                        onPress={() => fetchItemsAction && dispatch(fetchItemsAction())}
                    >
                        <Text style={styles.refreshIcon}>↻</Text>
                    </TouchableOpacity>
                    <View style={styles.addButtonContainer}>
                        <TouchableOpacity
                            testID="ui-generic-item-list-add-button"
                            onPress={createNew}
                            style={[
                                styles.addButton,
                                { backgroundColor: theme.theme.colors.primary },
                            ]}
                        >
                            <Text style={styles.addButtonLabel}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                </View>
            )}
            <View style={styles.content}>
                {items && (
                    <FlatList
                        data={visibleItems}
                        keyExtractor={(item, index) =>
                            `${item?.id ?? item?.name ?? 'list-item'}-${index}`
                        }
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
    const tokens = useDesignTokens();
    const borderTone = theme.theme.colors.grey4 || theme.theme.colors.grey3;

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            headerCard: {
                marginHorizontal: tokens.spacing.md,
                marginTop: tokens.spacing.md,
                marginBottom: tokens.spacing.sm,
                borderRadius: tokens.radii.lg,
                borderWidth: 1,
                borderColor: `${borderTone}55`,
                backgroundColor: `${theme.theme.colors.grey5}20`,
                paddingVertical: tokens.spacing.xs,
            },
            header: {
                marginHorizontal: tokens.spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
            },
            content: {
                paddingHorizontal: tokens.spacing.lg,
                paddingTop: tokens.spacing.sm,
                paddingBottom: tokens.spacing.lg,
                flex: 1,
            },
            columnHeader: {
                color: theme.theme.colors.grey3,
            },
            addButtonContainer: {
                width: 64,
                alignItems: 'flex-end',
                marginLeft: tokens.spacing.sm,
                marginRight: tokens.spacing.xs,
            },
            addButton: {
                width: 50,
                height: 50,
                borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
            },
            addButtonLabel: {
                color: '#fff',
                fontSize: 28,
                lineHeight: 28,
                fontWeight: '600',
                marginTop: -2,
            },
            searchContainer: {
                flex: 1,
            },
            searchInput: {
                backgroundColor: theme.theme.colors.grey5,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: `${borderTone}66`,
                color: theme.theme.colors.grey1,
                paddingHorizontal: 16,
                paddingVertical: 11,
                fontSize: 16,
            },
            refreshButton: {
                marginLeft: tokens.spacing.sm,
                paddingHorizontal: tokens.spacing.xs,
                paddingVertical: tokens.spacing.xs,
                alignItems: 'center',
                justifyContent: 'center',
            },
            refreshIcon: {
                color: theme.theme.colors.grey2,
                fontSize: 24,
                fontWeight: '600',
            },
        }),
    };
};

export default UIGenericItemList;
