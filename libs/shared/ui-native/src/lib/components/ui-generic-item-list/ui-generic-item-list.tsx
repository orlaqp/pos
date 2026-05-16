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
import { translateWithFallback } from '@pos/shared/utils';

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
    headerEyebrow?: string;
    headerTitle?: string;
    headerSubtitle?: string;
    plainHeader?: boolean;
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
    headerEyebrow,
    headerTitle,
    headerSubtitle,
    plainHeader,
}: ItemListProps<unknown, any>) {
    const t = translateWithFallback;
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
                <UISpinner size="small" message={t('COMMON_Loading', 'Loading...')} />
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
                <View style={[styles.headerCard, plainHeader && styles.plainHeaderCard]}>
                    {(headerTitle || headerSubtitle || headerEyebrow) && (
                        <View style={styles.headerIntro}>
                            {headerEyebrow ? (
                                <Text style={styles.headerEyebrow}>
                                    {headerEyebrow}
                                </Text>
                            ) : null}
                            {headerTitle ? (
                                <Text style={styles.headerTitle}>
                                    {headerTitle}
                                </Text>
                            ) : null}
                            {headerSubtitle ? (
                                <Text style={styles.headerSubtitle}>
                                    {headerSubtitle}
                                </Text>
                            ) : null}
                        </View>
                    )}
                    <View style={styles.actionRail}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                testID="ui-generic-item-list-search-input"
                                value={query}
                                placeholder={t('COMMON_Search', 'Search...')}
                                placeholderTextColor={theme.theme.colors.grey2}
                                style={styles.searchInput}
                                autoCorrect={false}
                                autoCapitalize="none"
                                returnKeyType="search"
                                onChangeText={(value) => setQuery(value)}
                                onSubmitEditing={(e) => {
                                    submitQuery(e.nativeEvent.text);
                                }}
                                onEndEditing={(e) =>
                                    submitQuery(e.nativeEvent.text)
                                }
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
                {isEmpty ? (
                    <View style={styles.emptyCard}>
                        <UIEmptyState
                            title={emptyTitle || t('COMMON_NothingHereYet', 'Nothing here yet')}
                            subtitle={
                                emptySubtitle ||
                                t(
                                    'COMMON_CreateFirstRecord',
                                    'Create the first record to start building this catalog section.',
                                )
                            }
                            actions={[
                                {
                                    title: emptyActionText || t('COMMON_AddItem', 'Add item'),
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
                ) : items ? (
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
                ) : null}
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
                borderRadius: 26,
                borderWidth: 1,
                borderColor: `${borderTone}55`,
                backgroundColor: '#080B10',
                padding: tokens.spacing.md,
            },
            plainHeaderCard: {
                borderWidth: 0,
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
                paddingVertical: 0,
            },
            headerIntro: {
                marginBottom: tokens.spacing.md,
            },
            headerEyebrow: {
                color: theme.theme.colors.primary,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                marginBottom: 4,
            },
            headerTitle: {
                color: theme.theme.colors.grey1,
                fontSize: 30,
                fontWeight: '800',
                letterSpacing: -0.6,
            },
            headerSubtitle: {
                color: theme.theme.colors.grey2,
                fontSize: 14,
                lineHeight: 20,
                marginTop: 4,
            },
            header: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            actionRail: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: tokens.spacing.sm,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: `${borderTone}33`,
                backgroundColor: '#0E141C',
                padding: tokens.spacing.sm,
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
                backgroundColor: '#151C25',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: `${borderTone}66`,
                color: theme.theme.colors.grey1,
                paddingHorizontal: 18,
                paddingVertical: 12,
                fontSize: 16,
            },
            refreshButton: {
                width: 50,
                height: 50,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: `${borderTone}44`,
                backgroundColor: '#111821',
                alignItems: 'center',
                justifyContent: 'center',
            },
            refreshIcon: {
                color: theme.theme.colors.primary,
                fontSize: 24,
                fontWeight: '600',
            },
            emptyCard: {
                minHeight: 320,
                borderRadius: 26,
                borderWidth: 1,
                borderColor: `${borderTone}44`,
                backgroundColor: '#080B10',
                overflow: 'hidden',
            },
        }),
    };
};

export default UIGenericItemList;
