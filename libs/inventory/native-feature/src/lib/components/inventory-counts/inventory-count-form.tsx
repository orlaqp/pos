import React, { useEffect, useState } from 'react';

import { Alert, FlatList, TextInput, View, Text } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { UIActions, UISearchInput } from '@pos/shared/ui-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import {
    inventoryCountActions,
    InventoryCountDTO,
    InventoryCountLineDTO,
    InventoryCountLineMapper,
    InventoryCountMapper,
    InventoryCountService,
} from '@pos/inventory/data-access';
import { RootState } from '@pos/store';
import { InventoryCount } from '@pos/shared/models';
import { fetchProducts, productsActions, ProductService, selectAllProducts, selectProductsEntities } from '@pos/products/data-access';
import { Button, useTheme } from '@rneui/themed';
import InventoryCountLine from '../inventory-counts/inventory-count-line';
import { confirm, Selectable } from '@pos/shared/utils';
import { NavigationParamList } from '@pos/sales/native-feature';
import { Dictionary } from '@reduxjs/toolkit';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: InventoryCount;
}

export function InventoryCountForm({
    navigation,
    route,
}: NativeStackScreenProps<NavigationParamList, 'Inventory Count Form'>) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>();
    const inventoryCount = useSelector(
        (state: RootState) => state.inventoryCount.selected
    );
    const products = useSelector(selectProductsEntities);
    const productList = useSelector(selectAllProducts);
    const [lines, setLines] = useState<
        Dictionary<Selectable<InventoryCountLineDTO>>
    >({});
    const [filteredLines, setFilteredLines] = useState<
        Dictionary<Selectable<InventoryCountLineDTO>>
    >({});

    const ref = React.createRef<TextInput>();

    useEffect(() => {
        setLines(InventoryCountLineMapper.toSelectable(products, inventoryCount));
    }, [inventoryCount, products]);

    const save = async (updateInv: boolean) => {
        setBusy(true);
        let inv: InventoryCountDTO;

        const countLines = Object.values(lines).filter(x => x?.selected).map(x => x?.payload);

        if (inventoryCount) {
            inv = {
                comments: inventoryCount.comments,
                lines: countLines,
                status: inventoryCount.status,
                id: inventoryCount.id,
                createdAt: inventoryCount.createdAt,
            };
        } else {
            inv = InventoryCountMapper.newCount();
            inv.lines = countLines;
        }

        if (updateInv) {
            inv.status = 'COMPLETED';
        }

        await InventoryCountService.save(dispatch, inv, updateInv);
        dispatch(inventoryCountActions.clearSelection());

        if (inv.status === 'COMPLETED') {
            dispatch(productsActions.updateQuantities(inv.lines));
        }
        
        navigation.goBack();
        setBusy(false);
    };

    const updateInventory = () => {
        confirm(
            '',
            'This action will adjust your inventory based on this count. You will no be able to undo this operation',
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
                        dispatch(inventoryCountActions.clearSelection());
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const updateItem = (item: InventoryCountLineDTO) => {
        const line = lines[item.productId];

        if (!line) return;

        line.payload.newCount = item.newCount;
        line.payload.comments = item.comments;
        line.selected = true;

        setLines({...lines});
    };

    const deleteItem = (item: InventoryCountLineDTO) => {
        setLines((res) => res.filter((i) => i.productId !== item.productId));
    };

    useEffect(() => {
        console.log('Running search');
        
        if (!filter) {
            setFilteredLines(lines);
            return;
        }

        const searchResult = ProductService.search(productList, { text: filter });
        const filteredResult: Dictionary<Selectable<InventoryCountLineDTO>> = {};
        
        searchResult.items.reduce((res, p) => {
            if (!lines[p.id]) return res;
            
            res[p.id!] = lines[p.id];
            return res;
        }, filteredResult);

        setFilteredLines(filteredResult);
    }, [filter, lines, productList]);

    return (
        // <FormProvider {...form}>
        <View style={[styles.page]}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
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
            />

            <View
                style={{
                    margin: 10,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                {!route.params?.readOnly && (
                    <>
                        <UIActions
                            busy={busy}
                            submitAction={() => save(false)}
                            cancelAction={confirmCancel}
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Button
                                color="success"
                                title="Update Inventory"
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
                    </>
                )}
            </View>
        </View>
        // </FormProvider>
    );
}

export default InventoryCountForm;
