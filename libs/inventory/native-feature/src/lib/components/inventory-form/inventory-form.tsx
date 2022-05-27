import React, { useEffect, useState } from 'react';

import { Alert, FlatList, TextInput, View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { UIActions, UIInput, UISearchInput } from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import {
    InventoryCountDTO,
    InventoryCountLineDTO,
    InventoryCountLineMapper,
    InventoryCountMapper,
    InventoryCountService,
} from '@pos/inventory/data-access';
import { RootState } from '@pos/store';
import { InventoryCount, Product } from '@pos/shared/models';
import { ProductService } from '@pos/products/data-access';
import { Button, useTheme } from '@rneui/themed';
import InventoryCountLine from '../inventory-count-line/inventory-count-line';
import { includes } from 'lodash';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: InventoryCount;
}

export interface InventoryFormProps {
    navigation: NativeStackNavigationProp<InventoryFormParams>;
    item: InventoryCountDTO;
}

export function InventoryForm({ navigation }: InventoryFormProps) {
    const inventoryCount = useSelector(
        (state: RootState) => state.inventoryCount.selected
    );
    const dispatch = useDispatch();
    const theme = useTheme();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>();
    const [lines, setLines] = useState<InventoryCountLineDTO[]>([]);
    const ref = React.createRef<TextInput>();

    useEffect(() => {
        if (!inventoryCount) {
            setLines([]);
            return;
        }
        
        setLines(inventoryCount.lines.map(l => ({...l})));
    }, [inventoryCount]);

    const save = async () => {
        setBusy(true);
        let inv: InventoryCountDTO;

        if (inventoryCount) {
            inv = {
                comments: inventoryCount.comments,
                lines: lines,
                status: inventoryCount.status,
                id: inventoryCount.id,
                createdAt: inventoryCount.createdAt,
            }
        } else {
            inv = InventoryCountMapper.newCount();
            inv.lines = lines;
        }
         
        await InventoryCountService.save(dispatch, inv);
        navigation.goBack();
        setBusy(false);
    };

    const confirmCancel = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => navigation.goBack() },
            ]
        );
    };

    const searchSubmit = (text: string) => {
        setFilter(text);
        ref.current?.clear();
    };

    const updateItem = (item: InventoryCountLineDTO) => {
        const idx = lines.findIndex((i) => i.productId === item.productId);

        if (idx === -1) return;

        lines[idx].newCount = item.newCount;
        lines[idx].comments = item.comments;

        setLines((res) => [...lines]);
    };

    const deleteItem = (item: InventoryCountLineDTO) => {
        setLines((res) => res.filter((i) => i.productId !== item.productId));
    };

    const updateInventory = () => {};

    useEffect(() => {
        console.log('Filter effect: ' + filter);

        if (!filter) return;

        const addItem = (product: Product) => {
            if (lines.find((i) => i.productId === product.id)) return;

            console.log('adding item: ' + product.name);

            setLines((res) => [
                ...res,
                InventoryCountLineMapper.fromProduct(product),
            ]);
        };

        const searchProduct = async (text?: string) => {
            if (!text) return;

            const products = await ProductService.searchByCode(text);
            console.log('Products', products);

            if (products.length !== 1) return;
            addItem(products[0]);
        };

        searchProduct(filter);
    }, [filter]);

    return (
        // <FormProvider {...form}>
        <View style={[styles.page]}>
            <View style={{ flexDirection: 'row' }}>
                {/* <View style={{ flex: 4 }}>
                        <UIInput name="comments" placeholder="Comments" />
                    </View> */}
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
            </View>
            <FlatList
                horizontal={false}
                data={lines}
                renderItem={(data) => (
                    <InventoryCountLine
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
                <UIActions
                    busy={busy}
                    submitAction={save}
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
                            color: theme.theme.colors.white,
                        }}
                        titleStyle={{
                            paddingRight: 20,
                        }}
                        disabledStyle={styles.darkBackground}
                        disabledTitleStyle={{ color: theme.theme.colors.grey5 }}
                    />
                </View>
            </View>
        </View>
        // </FormProvider>
    );
}

export default InventoryForm;
