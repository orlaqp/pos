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
    selectInventoryCountSelected,
} from '@pos/inventory/data-access';
import { InventoryCount } from '@pos/shared/models';
import { ProductEntity, productsActions, ProductService, selectAllProducts } from '@pos/products/data-access';
import { Button, useTheme } from '@rneui/themed';
import InventoryCountLine from '../inventory-counts/inventory-count-line';
import { confirm } from '@pos/shared/utils';
import { NavigationParamList } from '@pos/sales/native-feature';
import CompactProductList from '../shared/compact-product-list/compact-product-list';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { useForm } from 'react-hook-form';

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
    const inventoryCount = useSelector(selectInventoryCountSelected);
    const [lines, setLines] = useState<InventoryCountLineDTO[]>(
        inventoryCount ? inventoryCount.lines.map(l => ({...l})) : []
    );
    const ref = React.createRef<TextInput>();
    const products = useSelector(selectAllProducts);
    const [filteredProducts, setFilteredProducts] = useState<ProductEntity[]>(
        []
    );
    const employee = useSelector(selectLoginEmployee);

    const searchSubmit = (text: string) => {
        setFilter(text);
        ref.current?.clear();
    };

    const addItem = (product: ProductEntity) => {
        if (lines.find((i) => i.productId === product.id)) return;

        setLines((res) => [
            ...res,
            InventoryCountLineMapper.fromProduct(product),
        ]);

        setFilter('');
    };

    const updateItem = (item: InventoryCountLineDTO) => {
        const line = lines.find(l => l.productId === item.productId);

        if (!line) return;

        line.newCount = item.newCount;
        line.comments = item.comments;

        setLines([...lines]);
    };

    const deleteItem = (item: InventoryCountLineDTO) => {
        setLines((res) => res.filter((i) => i.productId !== item.productId));
    };

    const save = async (updateInv: boolean) => {
        const missingQuantity = lines.some(x => x.newCount === undefined || x.newCount === null);

        if (missingQuantity) {
            Alert.alert('Make sure all products have a new count value')
            return;
        }

        setBusy(true);
        let inv: InventoryCountDTO;

        if (inventoryCount) {
            inv = {
                comments: inventoryCount.comments,
                lines,
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
            inv.lines = lines;
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

    const form = useForm<InventoryCountDTO>({
        mode: 'onChange',
        defaultValues: {
            id: inventoryCount?.id,
            comments: inventoryCount?.comments,
            createdAt: inventoryCount?.createdAt,
            createdBy: inventoryCount?.createdBy,
            lines: inventoryCount?.lines.map(l => ({
                id: l.id,
                comments: l.comments,
                createdAt: l.createdAt,
                current: l.current,
                newCount: l.newCount,
                productId: l.productId,
                productName: l.productName,
                unitOfMeasure: l.unitOfMeasure,
                updatedAt: l.updatedAt
            })),
            status: inventoryCount?.status,
            updatedAt: inventoryCount?.updatedAt
        },
    });


    useEffect(() => {
        if (!filter) setFilteredProducts((prev) => []);

        const searchResult = ProductService.search(products, { text: filter });
        setFilteredProducts((prev) => [...searchResult.items]);
    }, [filter, products]);

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
                            This receive was already completed and cannot be
                            changed
                        </Text>
                    </View>
                )}
              
                {!route.params?.readOnly && (
                    <View style={{ flex: 3, padding: 10 }}>
                        <UISearchInput
                            ref={ref}
                            value={filter}
                            placeholder="Search for products ..."
                            debounceTime={700}
                            onSubmit={searchSubmit}
                            onClear={() => ref.current?.focus()}
                        />
                        {/* <TextInput onSubmitEditing={(e) => setFilter(e.nativeEvent.text)} style={{ borderColor: 'blue', borderWidth: 1 }} /> */}
                    </View>
                )}
            </View>
            {!route.params?.readOnly && (
                <CompactProductList
                    visible={!!filter}
                    products={filteredProducts}
                    onAdd={addItem}
                    onClose={() => setFilter('')}
                />
            )}

            <FlatList
                horizontal={false}
                data={lines}
                renderItem={(data) => (
                    <InventoryCountLine
                        readOnly={route.params?.readOnly}
                        item={data.item}
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
