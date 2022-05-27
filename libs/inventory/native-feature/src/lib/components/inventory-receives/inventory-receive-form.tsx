import React, { useEffect, useState } from 'react';

import { Alert, FlatList, TextInput, View, Text } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { UIActions, UISearchInput } from '@pos/shared/ui-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import {
    inventoryReceiveActions,
    InventoryReceiveDTO,
    InventoryReceiveLineDTO,
    InventoryReceiveLineMapper,
    InventoryReceiveMapper,
    InventoryReceiveService,
} from '@pos/inventory/data-access';
import { RootState } from '@pos/store';
import { InventoryReceive, Product } from '@pos/shared/models';
import { ProductService } from '@pos/products/data-access';
import { Button, useTheme } from '@rneui/themed';
import InventoryReceiveLine from '../inventory-receives/inventory-receive-line';
import { confirm } from '@pos/shared/utils';
import { NavigationParamList } from '@pos/sales/native-feature';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: InventoryReceive;
}

export function InventoryReceiveForm({
    navigation,
    route,
}: NativeStackScreenProps<NavigationParamList, 'Inventory Receive Form'>) {
    const inventoryReceive = useSelector(
        (state: RootState) => state.inventoryReceive.selected
    );
    const dispatch = useDispatch();
    const theme = useTheme();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>();
    const [lines, setLines] = useState<InventoryReceiveLineDTO[]>([]);
    const ref = React.createRef<TextInput>();

    useEffect(() => {
        if (!inventoryReceive) {
            setLines([]);
            return;
        }

        setLines(inventoryReceive.lines.map((l) => ({ ...l })));
    }, [inventoryReceive]);

    const save = async (updateInv: boolean) => {
        setBusy(true);
        let inv: InventoryReceiveDTO;

        if (inventoryReceive) {
            inv = {
                comments: inventoryReceive.comments,
                lines: lines,
                status: inventoryReceive.status,
                id: inventoryReceive.id,
                createdAt: inventoryReceive.createdAt,
            };
        } else {
            inv = InventoryReceiveMapper.newReceive();
            inv.lines = lines;
        }

        if (updateInv) {
            inv.status = 'COMPLETED';
        }

        await InventoryReceiveService.save(dispatch, inv, updateInv);
        dispatch(inventoryReceiveActions.clearSelection());
        navigation.goBack();
        setBusy(false);
    };

    const updateInventory = () => {
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
        ref.current?.clear();
    };

    const updateItem = (item: InventoryReceiveLineDTO) => {
        const idx = lines.findIndex((i) => i.productId === item.productId);

        if (idx === -1) return;

        lines[idx].received = item.received;
        lines[idx].comments = item.comments;

        setLines((res) => [...lines]);
    };

    const deleteItem = (item: InventoryReceiveLineDTO) => {
        setLines((res) => res.filter((i) => i.productId !== item.productId));
    };

    useEffect(() => {
        if (!filter) return;

        const addItem = (product: Product) => {
            if (lines.find((i) => i.productId === product.id)) return;

            setLines((res) => [
                ...res,
                InventoryReceiveLineMapper.fromProduct(product),
            ]);
        };

        const searchProduct = async (text?: string) => {
            if (!text) return;

            const products = await ProductService.searchByCode(text);
            
            if (products.length !== 1) return;
            addItem(products[0]);
        };

        searchProduct(filter);
    }, [lines, filter]);

    return (
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
                            This receive was already completed and cannot be changed
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
            <FlatList
                horizontal={false}
                data={lines}
                renderItem={(data) => (
                    <InventoryReceiveLine
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
    );
}

export default InventoryReceiveForm;
