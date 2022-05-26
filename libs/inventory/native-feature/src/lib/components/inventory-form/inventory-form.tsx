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
    InventoryCountService,
} from '@pos/inventory/data-access';
import { RootState } from '@pos/store';
import { InventoryCount, Product } from '@pos/shared/models';
import { ProductService } from '@pos/products/data-access';
import InventoryItem from '../inventory-item/inventory-item';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: InventoryCount;
}

export interface InventoryFormProps {
    navigation: NativeStackNavigationProp<InventoryFormParams>;
}

export function InventoryForm({ navigation }: InventoryFormProps) {
    const inventory = useSelector(
        (state: RootState) => state.inventoryCount.selected
    );
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>();
    const [value, setValue] = useState<string>();
    const [items, setItems] = useState<InventoryCountLineDTO[]>([]);
    const ref = React.createRef<TextInput>();
    const newRef = React.createRef<TextInput>();

    const save = async () => {
        setBusy(true);
        const formValues: InventoryCountDTO = form.getValues();

        if (!formValues.id) {
            delete formValues.id;
        }

        await InventoryCountService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm<InventoryCountDTO>({
        mode: 'onChange',
        defaultValues: {
            id: inventory?.id,
            comments: inventory?.comments,
            createdAt: new Date().toISOString(),
        },
    });

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
        const idx = items.findIndex(i => i.productId === item.productId);
        
        if (idx === -1) return;

        items[idx].newCount = item.newCount;
        items[idx].comments = item.comments;

        setItems(res => [...items]);
    }
    const deleteItem = (item: InventoryCountLineDTO) => {
        setItems(res => res.filter(i => i.productId !== item.productId))
    }

    useEffect(() => {
        console.log('Filter effect: ' + filter);

        if (!filter) return;

        const addItem = (product: Product) => {
            if (items.find((i) => i.productId === product.id)) return;

            console.log('adding item: ' + product.name);

            setItems((res) => [
                ...res,
                InventoryCountLineMapper.fromProduct(product)
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
        <FormProvider {...form}>
            <View style={[styles.page]}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 2 }}>
                        <UIInput
                            name="createdAt"
                            placeholder="Created At"
                            editable={false}
                        />
                    </View>
                    <View style={{ flex: 4 }}>
                        <UIInput name="comments" placeholder="Comments" />
                    </View>
                </View>
                <FlatList
                    horizontal={false}
                    data={items}
                    renderItem={(data) => (
                        <InventoryItem
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
                        marginTop: 50,
                    }}
                />

                <View
                    style={{
                        margin: 20,
                        flexDirection: 'row',
                        justifyContent: 'center',
                    }}
                >
                    <View style={{ flex: 0.5 }}>
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
                <UIActions
                    busy={busy}
                    submitAction={form.handleSubmit(save)}
                    cancelAction={confirmCancel}
                />
            </View>
        </FormProvider>
    );
}

export default InventoryForm;
