import React, { useEffect, useRef, useState } from 'react';

import { Alert, FlatList, StyleSheet, TextInput, View, Text } from 'react-native';
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
    fetchProducts,
    ProductService,
    selectAllProducts,
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { Button, useTheme } from '@rneui/themed';
import InventoryReceiveLine from '../inventory-receives/inventory-receive-line';
import { confirm } from '@pos/shared/utils';
import { NavigationParamList } from '@pos/sales/native-feature';
import CompactProductList from '../shared/compact-product-list/compact-product-list';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { dedupeProducts } from '../shared/dedupe-products';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: InventoryReceive;
}

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
}: NativeStackScreenProps<NavigationParamList, 'Inventory Receive Form'>) {
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
    const [filter, setFilter] = useState<string>();
    const [lines, setLines] = useState<InventoryReceiveLineDTO[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductEntity[]>([]);
    
    const ref = useRef<TextInput>(null);

    useEffect(() => {
        if (!inventoryReceive) {
            setLines([]);
            return;
        }

        setLines(inventoryReceive.lines.map((l) => ({ ...l })));
    }, [inventoryReceive]);

    const save = async (updateInv: boolean) => {
        if (busy) return;
        setBusy(true);
        let inv: InventoryReceiveDTO;

        if (inventoryReceive) {
            inv = {
                comments: inventoryReceive.comments,
                lines: lines,
                status: inventoryReceive.status,
                id: inventoryReceive.id,
                // createdAt: inventoryReceive.createdAt,
                createdBy: {
                    id: employee?.id,
                    name: `${employee?.firstName} ${employee?.lastName}`
                }
            };
        } else {
            if (!employee) {
                Alert.alert('The system could not find the details of the logged in employee');
                setBusy(false);
                return;
            }

            inv = InventoryReceiveMapper.newReceive(employee);
            inv.lines = lines;
        }

        if (updateInv) {
            inv.status = 'COMPLETED';
        }

        await InventoryReceiveService.save(dispatch, inv, updateInv);
        if (updateInv) {
            await dispatch(fetchProducts());
        }
        dispatch(inventoryReceiveActions.clearSelection());
        navigation.goBack();
        setBusy(false);
    };

    const updateInventory = () => {
        if (busy) return;
        confirm(
            '',
            'This action will adjust your inventory based on this receive. You will no be able to undo this operation',
            () => save(true)
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
        setFilter(text);
        // ref.current?.clear();
    };

    const updateItem = (item: InventoryReceiveLineDTO) => {
        setLines(applyReceiveLineUpdate(lines, item));
    };

    const deleteItem = (item: InventoryReceiveLineDTO) => {
        setLines((res) => res.filter((i) => i.productId !== item.productId));
    };

    const addItem = (product: ProductEntity) => {
        const result = appendReceiveLineIfMissing(lines, product);
        if (!result.added) return;

        setLines(result.nextLines);

        setFilter('');
    };

    useEffect(() => {
        if (!filter?.trim()) {
            setFilteredProducts((prev) => (prev.length === 0 ? prev : []));
            return;
        }

        const searchResult = ProductService.search(products, { text: filter.trim() });
        setFilteredProducts(dedupeProducts(searchResult.items));
    }, [filter, products]);

    useEffect(() => {
        const productsSub = subscribeToProductChanges(dispatch);
        return () => {
            console.log('Closing inventory receive form subscriptions');
            productsSub.unsubscribe();
        };
    }, [dispatch]);

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
                    visible={!!filter}
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
                            readOnly={route.params?.readOnly}
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
                            submitAction={() => save(false)}
                            cancelAction={confirmCancel}
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Button
                                color="success"
                                title="Update Inventory"
                                testID="inventory-receive-update-inventory-button"
                                onPress={updateInventory}
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
