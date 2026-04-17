import React, { useEffect, useRef, useState } from 'react';

import { Alert, FlatList, Keyboard, StyleSheet, TextInput, View, Text } from 'react-native';
import { getThemeColors, useSharedStyles } from '@pos/theme/native';
import { UIActions, UICard, UIScreen, UISearchInput } from '@pos/shared/ui-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import {
    inventoryCountActions,
    InventoryCountDTO,
    InventoryCountLineDTO,
    InventoryCountLineMapper,
    InventoryCountMapper,
    InventoryCountService,
    selectInventoryCountSelected,
} from '@pos/inventory/data-access';
import { InventoryCount } from '@pos/shared/models';
import { ProductEntity, ProductService, selectAllProducts } from '@pos/products/data-access';
import { Button, useTheme } from '@rneui/themed';
import InventoryCountLine from '../inventory-counts/inventory-count-line';
import { confirm } from '@pos/shared/utils';
import { NavigationParamList } from '@pos/sales/native-feature';
import CompactProductList from '../shared/compact-product-list/compact-product-list';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { dedupeProducts } from '../shared/dedupe-products';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { useAppDispatch } from '@pos/store';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: InventoryCount;
}

type CountMode = 'quick' | 'full';
type PendingAction = 'save' | 'submit' | null;

export const asFullCountLines = (
    existingLines: InventoryCountLineDTO[],
    products: ProductEntity[]
) => {
    const existingByProduct = new Map(
        existingLines.map((line) => [line.productId, line])
    );

    const eligibleProducts = dedupeProducts(products)
        .filter((product) => product.isActive && product.trackStock)
        .sort((a, b) => a.name.localeCompare(b.name));

    const merged = eligibleProducts.map((product) => {
        const existing = existingByProduct.get(product.id);
        return existing || InventoryCountLineMapper.fromProduct(product);
    });

    const manualOnly = existingLines.filter(
        (line) => !eligibleProducts.some((product) => product.id === line.productId)
    );

    return [...merged, ...manualOnly];
};

export const normalizeCode = (value?: string | null) =>
    (value || '').trim().toLowerCase();

export const isExactCodeMatch = (product: ProductEntity, query: string) => {
    const normalizedQuery = normalizeCode(query);
    if (!normalizedQuery) return false;

    return (
        normalizeCode(product.barcode) === normalizedQuery ||
        normalizeCode(product.sku) === normalizedQuery ||
        normalizeCode(product.plu) === normalizedQuery
    );
};

export const appendCountLineIfMissing = (
    lines: InventoryCountLineDTO[],
    product: ProductEntity
) => {
    if (lines.find((line) => line.productId === product.id)) {
        return { added: false, nextLines: lines };
    }

    return {
        added: true,
        nextLines: [...lines, InventoryCountLineMapper.fromProduct(product)],
    };
};

export const applyCountLineUpdate = (
    lines: InventoryCountLineDTO[],
    item: InventoryCountLineDTO
) => {
    const index = lines.findIndex((line) => line.productId === item.productId);
    if (index === -1) return lines;

    const next = [...lines];
    next[index] = {
        ...next[index],
        newCount: item.newCount,
        comments: item.comments,
    };
    return next;
};

export function InventoryCountForm({
    navigation,
    route,
}: NativeStackScreenProps<NavigationParamList, 'Inventory Count Form'>) {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens, colors);
    const [busy, setBusy] = useState<boolean>(false);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const [filter, setFilter] = useState<string>();
    const inventoryCount = useSelector(selectInventoryCountSelected);
    const [lines, setLines] = useState<InventoryCountLineDTO[]>(
        inventoryCount ? inventoryCount.lines.map(l => ({...l})) : []
    );
    const linesRef = useRef<InventoryCountLineDTO[]>(
        inventoryCount ? inventoryCount.lines.map((l) => ({ ...l })) : []
    );
    const ref = useRef<TextInput>(null);
    const products = useSelector(selectAllProducts);
    const [filteredProducts, setFilteredProducts] = useState<ProductEntity[]>(
        []
    );
    const [countMode, setCountMode] = useState<CountMode>('quick');
    const [fullCountInitialized, setFullCountInitialized] = useState(false);
    const [quickModeLines, setQuickModeLines] = useState<InventoryCountLineDTO[]>(
        inventoryCount ? inventoryCount.lines.map((l) => ({ ...l })) : []
    );
    const employee = useSelector(selectLoginEmployee);

    const runAfterInputCommit = (action: () => void) => {
        Keyboard.dismiss();
        setTimeout(action, 0);
    };

    const syncLinesState = (
        updater:
            | InventoryCountLineDTO[]
            | ((current: InventoryCountLineDTO[]) => InventoryCountLineDTO[])
    ) => {
        setLines((current) => {
            const next =
                typeof updater === 'function'
                    ? (updater as (current: InventoryCountLineDTO[]) => InventoryCountLineDTO[])(current)
                    : updater;
            linesRef.current = next;
            return next;
        });
    };

    const searchSubmit = (text: string) => {
        if (busy) return;
        setFilter(text);
        ref.current?.clear();
    };

    const addItem = (product: ProductEntity) => {
        if (busy) return;
        syncLinesState((current) => {
            const result = appendCountLineIfMissing(current, product);
            if (!result.added) return current;

            const next = result.nextLines;
            if (!inventoryCount && countMode === 'quick') {
                setQuickModeLines(next);
            }
            return next;
        });
        setFilter('');
    };

    const updateItem = (item: InventoryCountLineDTO) => {
        syncLinesState((current) => applyCountLineUpdate(current, item));
    };

    const deleteItem = (item: InventoryCountLineDTO) => {
        syncLinesState((res) => {
            const next = res.filter((i) => i.productId !== item.productId);
            if (!inventoryCount && countMode === 'quick') {
                setQuickModeLines(next);
            }
            return next;
        });
    };

    const save = async (updateInv: boolean, action: Exclude<PendingAction, null>) => {
        if (busy) return;
        const currentLines = linesRef.current;
        const missingQuantity = currentLines.some(x => x.newCount === undefined || x.newCount === null);

        if (missingQuantity) {
            Alert.alert('Make sure all products have a new count value')
            return;
        }

        setPendingAction(action);
        setBusy(true);
        try {
            let inv: InventoryCountDTO;

            if (inventoryCount) {
                inv = {
                    comments: inventoryCount.comments,
                    lines: currentLines,
                    status: inventoryCount.status,
                    id: inventoryCount.id,
                    createdBy: {
                        id: employee?.id,
                        name: `${employee?.firstName} ${employee?.lastName}`
                    },
                    createdAt: inventoryCount.createdAt,
                };
            } else {
                if (!employee) {
                    Alert.alert('No employee found');
                    return;
                }

                inv = InventoryCountMapper.newCount(employee);
                inv.lines = currentLines;
            }

            if (updateInv) {
                inv.status = 'COMPLETED';
            }

            const saved = await InventoryCountService.save(dispatch, inv, updateInv);
            if (!saved) {
                return;
            }

            dispatch(inventoryCountActions.clearSelection());
            navigation.goBack();
        } finally {
            setBusy(false);
            setPendingAction(null);
        }
    };

    const updateInventory = () => {
        confirm(
            '',
            'This action will adjust your inventory based on this count. You will no be able to undo this operation',
            () => save(true, 'submit')
        );
    };

    const confirmCancel = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                {
                    text: 'Yes',
                    onPress: () => {
                        dispatch(inventoryCountActions.clearSelection());
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    useEffect(() => {
        if (inventoryCount) {
            setCountMode('quick');
            setFullCountInitialized(true);
            return;
        }

        if (countMode !== 'full' || fullCountInitialized) return;

        syncLinesState((prev) => asFullCountLines(prev, products));
        setFullCountInitialized(true);
    }, [countMode, fullCountInitialized, inventoryCount, products]);

    useEffect(() => {
        if (!filter?.trim()) {
            setFilteredProducts([]);
            return;
        }

        const normalizedFilter = filter.trim();
        const searchResult = ProductService.search(products, {
            text: normalizedFilter,
        });
        const deduped = dedupeProducts(searchResult.items);

        if (deduped.length === 1) {
            const onlyItem = deduped[0];
            const scannerLikeInput =
                searchResult.allNumbers ||
                isExactCodeMatch(onlyItem, normalizedFilter);

            if (scannerLikeInput) {
                setLines((prev) => {
                    if (prev.find((line) => line.productId === onlyItem.id)) {
                        return prev;
                    }

                    const next = [
                        ...prev,
                        InventoryCountLineMapper.fromProduct(onlyItem),
                    ];
                    if (!inventoryCount && countMode === 'quick') {
                        setQuickModeLines(next);
                    }
                    return next;
                });
                setFilter('');
                setFilteredProducts([]);
                return;
            }
        }

        setFilteredProducts(deduped);
    }, [filter, products, countMode, inventoryCount]);

    const lineItems = lines;
    const totalItems = lineItems.length;
    const countedItems = lineItems.filter(
        (line) => line.newCount !== undefined && line.newCount !== null
    ).length;
    const progress = totalItems > 0 ? countedItems / totalItems : 0;

    const enableFullCountMode = () => {
        if (busy) return;
        if (!inventoryCount) {
            setQuickModeLines(lines.map((line) => ({ ...line })));
        }
        setCountMode('full');
        setFullCountInitialized(false);
    };

    const enableQuickCountMode = () => {
        if (busy) return;
        setCountMode('quick');
        if (!inventoryCount) {
            syncLinesState(quickModeLines.map((line) => ({ ...line })));
        }
    };

    const regenerateFullCount = () => {
        if (busy) return;
        syncLinesState((prev) => asFullCountLines(prev, products));
        setFilter('');
    };

    // useEffect(() => {
    //     setLines(InventoryCountLineMapper.toSelectable(products, inventoryCount));
    // }, [inventoryCount, products]);

    // const save = async (updateInv: boolean) => {
    //     setBusy(true);
    //     let inv: InventoryCountDTO;

    //     const countLines = Object.values(lines).filter(x => x?.selected).map(x => x?.payload);

    //     if (inventoryCount) {
    //         inv = {
    //             comments: inventoryCount.comments,
    //             lines: countLines,
    //             status: inventoryCount.status,
    //             id: inventoryCount.id,
    //             createdAt: inventoryCount.createdAt,
    //         };
    //     } else {
    //         inv = InventoryCountMapper.newCount();
    //         inv.lines = countLines;
    //     }

    //     if (updateInv) {
    //         inv.status = 'COMPLETED';
    //     }

    //     await InventoryCountService.save(dispatch, inv, updateInv);
    //     dispatch(inventoryCountActions.clearSelection());

    //     if (inv.status === 'COMPLETED') {
    //         dispatch(productsActions.updateQuantities(inv.lines));
    //     }
        
    //     navigation.goBack();
    //     setBusy(false);
    // };

    // const updateInventory = () => {
    //     confirm(
    //         '',
    //         'This action will adjust your inventory based on this count. You will no be able to undo this operation',
    //         () => save(true)
    //     );
    // };

    // const confirmCancel = () => {
    //     Alert.alert(
    //         'Are you sure?',
    //         'You will not be able to undo this operation',
    //         [
    //             { text: 'No' },
    //             {
    //                 text: 'Yes',
    //                 onPress: () => {
    //                     dispatch(inventoryCountActions.clearSelection());
    //                     navigation.goBack();
    //                 },
    //             },
    //         ]
    //     );
    // };

    // const updateItem = (item: InventoryCountLineDTO) => {
    //     debugger;
    //     const line = lines[item.productId];

    //     if (!line) return;

    //     line.payload.newCount = item.newCount;
    //     line.payload.comments = item.comments;
    //     line.selected = true;

    //     setLines({...lines});
    // };

    // const deleteItem = (item: InventoryCountLineDTO) => {
    //     setLines((res) => res.filter((i) => i.productId !== item.productId));
    // };

    // useEffect(() => {
    //     console.log('Running search');
        
    //     if (!filter) {
    //         setFilteredLines(lines);
    //         return;
    //     }

    //     const searchResult = ProductService.search(productList, { text: filter });
    //     const filteredResult: Dictionary<Selectable<InventoryCountLineDTO>> = {};
        
    //     searchResult.items.reduce((res, p) => {
    //         if (!lines[p.id]) return res;
            
    //         res[p.id!] = lines[p.id];
    //         return res;
    //     }, filteredResult);

    //     setFilteredLines(filteredResult);
    // }, [filter, lines, productList]);

    return (
        <UIScreen>
        <View style={[styles.page]}>
            <UICard tone="muted" style={local.headerCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {route.params?.readOnly && (
                    <View
                        style={local.readOnlyBanner}
                    >
                        <Text
                            style={[
                                styles.primaryText,
                                styles.textCenter,
                                styles.textBold,
                            ]}
                        >
                            This receive was already completed and cannot be
                            changed
                        </Text>
                    </View>
                )}
              
                {!route.params?.readOnly && (
                    <View style={local.searchWrap}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={local.searchInputWrap}>
                                <UISearchInput
                                    ref={ref}
                                    value={filter}
                                    editable={!busy}
                                    placeholder="Search for products ..."
                                    debounceTime={700}
                                    onChangeText={setFilter}
                                    onSubmit={searchSubmit}
                                    onClear={() => ref.current?.focus()}
                                />
                            </View>
                            {!inventoryCount && (
                                <View style={local.modeButtonsRow}>
                                    <Button
                                        type={countMode === 'quick' ? 'solid' : 'outline'}
                                        title="Quick"
                                        testID="inventory-count-mode-quick"
                                        onPress={enableQuickCountMode}
                                        buttonStyle={local.modeButton}
                                        disabled={busy}
                                    />
                                    <View style={{ marginLeft: 8 }}>
                                        <Button
                                            type={countMode === 'full' ? 'solid' : 'outline'}
                                            title="Full"
                                            testID="inventory-count-mode-full"
                                            onPress={enableFullCountMode}
                                            buttonStyle={local.modeButton}
                                            disabled={busy}
                                        />
                                    </View>
                                    {countMode === 'full' && (
                                        <View style={{ marginLeft: 8 }}>
                                            <Button
                                                type="outline"
                                                title="Reload"
                                                testID="inventory-count-mode-reload"
                                                onPress={regenerateFullCount}
                                                buttonStyle={local.modeButton}
                                                disabled={busy}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={local.progressBlock}>
                            {!inventoryCount && (
                                <Text style={[styles.secondaryText, { fontSize: 12 }]}>
                                    {countMode === 'quick'
                                        ? 'Quick: search/scan and add only what you count.'
                                        : 'Full: preload all active stock-tracked products.'}
                                </Text>
                            )}
                            <Text style={styles.secondaryText}>
                                Count Progress: {countedItems} / {totalItems}
                            </Text>
                            <View style={local.progressTrack}>
                                <View
                                    style={{
                                        height: 8,
                                        width: `${Math.round(progress * 100)}%`,
                                        backgroundColor: theme.theme.colors.primary,
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </View>
            </UICard>
            {!route.params?.readOnly && (
                <CompactProductList
                    visible={!busy && !!filter?.trim()}
                    products={filteredProducts}
                    onAdd={addItem}
                    onClose={() => setFilter('')}
                />
            )}

            <View style={local.listWrap}>
                <FlatList
                    horizontal={false}
                    data={lineItems}
                    keyExtractor={(item) => item.productId}
                    renderItem={(data) => (
                        <InventoryCountLine
                            readOnly={route.params?.readOnly || busy}
                            item={data.item}
                            onUpdate={updateItem}
                            onDelete={deleteItem}
                        />
                    )}
                    style={local.list}
                    contentContainerStyle={local.listContent}
                />
            </View>
            {/* <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {route.params?.readOnly && (
                    <View
                        style={{
                            width: '65%',
                            padding: 5,
                            marginVertical: 10,
                            borderRadius: 10,
                            backgroundColor: theme.theme.colors.warning,
                        }}
                    >
                        <Text
                            style={[
                                styles.primaryText,
                                styles.textCenter,
                                styles.textBold,
                            ]}
                        >
                            This count was already completed and cannot be
                            changed
                        </Text>
                    </View>
                )}
                {!route.params?.readOnly && (
                    <View style={{ flex: 3, padding: 10 }}>
                        <UISearchInput
                            ref={ref}
                            placeholder="Search for products ..."
                            onSubmit={setFilter}
                        />
                    </View>
                )}
            </View>
            
        <FlatList
                horizontal={false}
                data={Object.values(filteredLines)}
                renderItem={(data) => (
                    <InventoryCountLine
                        readOnly={route.params?.readOnly}
                        item={data.item?.payload}
                        key={data.index}
                        navigation={navigation}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                    />
                )}
                style={{
                    flex: 1,
                    flexDirection: 'column',
                }}
            /> */}

            <View
                style={local.footerRow}
            >
                {!route.params?.readOnly && (
                    <UICard tone="muted" style={local.footerCard}>
                    <View style={local.footerButtons}>
                        <UIActions
                            busy={busy}
                            submitLoading={pendingAction === 'save'}
                            submitAction={() => runAfterInputCommit(() => save(false, 'save'))}
                            cancelAction={confirmCancel}
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Button
                                color="success"
                                title="Update Inventory"
                                testID="inventory-count-update-inventory-button"
                                onPress={() => runAfterInputCommit(updateInventory)}
                                loading={busy && pendingAction === 'submit'}
                                icon={{
                                    name: 'scale-balance',
                                    type: 'material-community',
                                    color: theme.theme.colors.grey0,
                                }}
                                titleStyle={{
                                    paddingRight: 20,
                                }}
                                disabledStyle={styles.darkBackground}
                                disabledTitleStyle={{
                                    color: theme.theme.colors.grey5,
                                }}
                                disabled={busy}
                            />
                        </View>
                    </View>
                    </UICard>
                )}
            </View>
        </View>
        </UIScreen>
    );
}

const useStyles = (
    tokens: ReturnType<typeof useDesignTokens>,
    colors: Record<string, string>
) =>
    StyleSheet.create({
        headerCard: {
            marginHorizontal: tokens.spacing.md,
            marginTop: tokens.spacing.md,
            marginBottom: tokens.spacing.sm,
        },
        readOnlyBanner: {
            width: '65%',
            padding: 8,
            marginVertical: 10,
            borderRadius: 10,
            backgroundColor: colors.warning,
        },
        searchWrap: {
            flex: 3,
            padding: 10,
        },
        searchInputWrap: {
            flex: 1,
            maxWidth: 900,
        },
        modeButtonsRow: {
            flexDirection: 'row',
            marginLeft: 8,
            alignItems: 'center',
        },
        modeButton: {
            paddingHorizontal: 12,
            borderRadius: 18,
        },
        progressBlock: {
            marginTop: 6,
        },
        progressTrack: {
            marginTop: 6,
            height: 8,
            width: '100%',
            borderRadius: 8,
            backgroundColor: colors.grey5,
            overflow: 'hidden',
        },
        footerRow: {
            marginHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.md,
        },
        listWrap: {
            flex: 1,
            marginHorizontal: tokens.spacing.md,
        },
        list: {
            flex: 1,
            flexDirection: 'column',
        },
        listContent: {
            paddingTop: tokens.spacing.xs,
            paddingBottom: tokens.spacing.sm,
        },
        footerCard: {
            paddingVertical: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.md,
        },
        footerButtons: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
    });

export default InventoryCountForm;
