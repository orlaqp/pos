import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Alert, FlatList, Keyboard, StyleSheet, TextInput, View, Text } from 'react-native';
import { getThemeColors, useSharedStyles } from '@pos/theme/native';
import { UIActions, UICard, UIScreen, UISearchInput } from '@pos/shared/ui-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import {
    inventoryReceiveActions,
    InventoryReceiveDTO,
    InventoryReceiveLineDTO,
    InventoryReceiveLineMapper,
    InventoryReceiveMapper,
    InventoryReceiveService,
} from '@pos/inventory/data-access';
import { RootState, useAppDispatch } from '@pos/store';
import { InventoryReceive } from '@pos/shared/models';
import {
    ProductEntity,
    ProductService,
    selectAllProducts,
} from '@pos/products/data-access';
import { Button, useTheme } from '@rneui/themed';
import InventoryReceiveLine from '../inventory-receives/inventory-receive-line';
import { confirm } from '@pos/shared/utils';
import CompactProductList from '../shared/compact-product-list/compact-product-list';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { dedupeProducts } from '../shared/dedupe-products';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: InventoryReceive;
}

interface InventoryReceiveNavigationParamList {
    'Inventory Receive Form': {
        readOnly?: boolean;
    };
}

type PendingAction = 'save' | 'submit' | null;

export const appendReceiveLineIfMissing = (
    lines: InventoryReceiveLineDTO[],
    product: ProductEntity
) => {
    if (lines.find((line) => line.productId === product.id)) {
        return { added: false, nextLines: lines };
    }

    return {
        added: true,
        nextLines: [...lines, InventoryReceiveLineMapper.fromProduct(product)],
    };
};

export const applyReceiveLineUpdate = (
    lines: InventoryReceiveLineDTO[],
    item: InventoryReceiveLineDTO
) => {
    const idx = lines.findIndex((line) => line.productId === item.productId);
    if (idx === -1) return lines;

    const next = [...lines];
    next[idx] = {
        ...next[idx],
        received: item.received,
        comments: item.comments,
    };
    return next;
};

export function InventoryReceiveForm({
    navigation,
    route,
}: NativeStackScreenProps<
    InventoryReceiveNavigationParamList,
    'Inventory Receive Form'
>) {
    const inventoryReceive = useSelector(
        (state: RootState) => state.inventoryReceive.selected
    );
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens, colors);
    const products = useSelector(selectAllProducts);
    const employee = useSelector(selectLoginEmployee);
    const [busy, setBusy] = useState<boolean>(false);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const [filter, setFilter] = useState<string>();
    const [lines, setLines] = useState<InventoryReceiveLineDTO[]>([]);
    const linesRef = useRef<InventoryReceiveLineDTO[]>([]);
    const ref = useRef<TextInput>(null);

    const syncLinesState = (
        updater:
            | InventoryReceiveLineDTO[]
            | ((current: InventoryReceiveLineDTO[]) => InventoryReceiveLineDTO[])
    ) => {
        setLines((current) => {
            const next =
                typeof updater === 'function'
                    ? (updater as (current: InventoryReceiveLineDTO[]) => InventoryReceiveLineDTO[])(current)
                    : updater;
            linesRef.current = next;
            return next;
        });
    };

    useEffect(() => {
        if (!inventoryReceive) {
            syncLinesState([]);
            return;
        }

        syncLinesState(inventoryReceive.lines.map((l) => ({ ...l })));
    }, [inventoryReceive]);

    const save = async (updateInv: boolean, action: Exclude<PendingAction, null>) => {
        if (busy) return;
        setPendingAction(action);
        setBusy(true);
        try {
            const currentLines = linesRef.current;
            let inv: InventoryReceiveDTO;

            if (inventoryReceive) {
                inv = {
                    comments: inventoryReceive.comments,
                    lines: currentLines,
                    status: inventoryReceive.status,
                    id: inventoryReceive.id,
                    createdBy: {
                        id: employee?.id,
                        name: `${employee?.firstName} ${employee?.lastName}`
                    }
                };
            } else {
                if (!employee) {
                    Alert.alert('The system could not find the details of the logged in employee');
                    return;
                }

                inv = InventoryReceiveMapper.newReceive(employee);
                inv.lines = currentLines;
            }

            if (updateInv) {
                inv.status = 'COMPLETED';
            }

            const saved = await InventoryReceiveService.save(dispatch, inv, updateInv);
            if (!saved) {
                return;
            }

            dispatch(inventoryReceiveActions.clearSelection());
            navigation.goBack();
        } finally {
            setBusy(false);
            setPendingAction(null);
        }
    };

    const updateInventory = () => {
        if (busy) return;
        Keyboard.dismiss();
        confirm(
            '',
            'This action will adjust your inventory based on this receive. You will no be able to undo this operation',
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
                        dispatch(inventoryReceiveActions.clearSelection());
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const searchSubmit = (text: string) => {
        if (busy) return;
        setFilter(text);
        // ref.current?.clear();
    };

    const updateItem = (item: InventoryReceiveLineDTO) => {
        syncLinesState((current) => applyReceiveLineUpdate(current, item));
    };

    const deleteItem = (item: InventoryReceiveLineDTO) => {
        syncLinesState((res) => res.filter((i) => i.productId !== item.productId));
    };

    const addItem = (product: ProductEntity) => {
        if (busy) return;
        let added = false;
        syncLinesState((current) => {
            const result = appendReceiveLineIfMissing(current, product);
            added = result.added;
            return result.added ? result.nextLines : current;
        });
        if (!added) return;
        setFilter('');
    };

    const filteredProducts = useMemo(() => {
        if (!filter?.trim()) {
            return [];
        }

        const searchResult = ProductService.search(products, {
            text: filter.trim(),
        });

        return dedupeProducts(searchResult.items);
    }, [filter, products]);

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
                        <UISearchInput
                            ref={ref}
                            testID="inventory-receive-search-input"
                            value={filter}
                            editable={!busy}
                            placeholder="Search for products ..."
                            debounceTime={700}
                            onChangeText={setFilter}
                            onSubmit={searchSubmit}
                            onClear={() => ref.current?.focus()}
                        />
                        {/* <TextInput onSubmitEditing={(e) => setFilter(e.nativeEvent.text)} style={{ borderColor: 'blue', borderWidth: 1 }} /> */}
                    </View>
                )}
            </View>
            </UICard>
            {!route.params?.readOnly && (
                <CompactProductList
                    visible={!busy && !!filter}
                    products={filteredProducts}
                    onAdd={addItem}
                    onClose={() => setFilter('')}
                />
            )}

            <View style={local.listWrap}>
                <FlatList
                    horizontal={false}
                    data={lines}
                    renderItem={(data) => (
                        <InventoryReceiveLine
                            readOnly={route.params?.readOnly || busy}
                            item={data.item}
                            key={data.index}
                            onUpdate={updateItem}
                            onDelete={deleteItem}
                        />
                    )}
                    style={local.list}
                    contentContainerStyle={local.listContent}
                />
            </View>

            <View
                style={local.footerRow}
            >
                {!route.params?.readOnly && (
                    <UICard tone="muted" style={local.footerCard}>
                    <View style={local.footerButtons}>
                        <UIActions
                            busy={busy}
                            submitLoading={pendingAction === 'save'}
                            submitAction={() => save(false, 'save')}
                            cancelAction={confirmCancel}
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Button
                                color="success"
                                title="Update Inventory"
                                testID="inventory-receive-update-inventory-button"
                                onPress={updateInventory}
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

export default InventoryReceiveForm;
