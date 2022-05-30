import React, { useEffect, useState } from 'react';

import { Alert, TextInput, View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import {
    UIActions,
    UiFileUpload,
    UIInput,
    UINumericInput,
    UIOverlaySelect,
    UISwitch,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { ProductEntity, ProductService } from '@pos/products/data-access';
import { RootState } from '@pos/store';
import { Product } from '@pos/shared/models';
import { selectAllCategories } from '@pos/categories/data-access';
import { selectAllBrands } from '@pos/brands/data-access';
import { selectAllUnitOfMeasures } from '@pos/unit-of-measures/data-access';
import { useTheme, Input } from '@rneui/themed';

export interface ProductFormParams {
    [name: string]: object | undefined;
    product: Product;
}

export interface ProductFormProps {
    navigation: NativeStackNavigationProp<ProductFormParams>;
}

export function ProductForm({ navigation }: ProductFormProps) {
    const product = useSelector((state: RootState) => state.products.selected);
    const categories = useSelector(selectAllCategories);
    const brands = useSelector(selectAllBrands);
    const ums = useSelector(selectAllUnitOfMeasures);
    const dispatch = useDispatch();
    const barcodeRef = React.createRef<TextInput>();
    const skuRef = React.createRef<TextInput>();
    const pluRef = React.createRef<TextInput>();

    const theme = useTheme();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const updatePicture = (key: string) => {
        form.setValue('picture', key);
    };

    const save = async () => {
        setBusy(true);
        const formValues: ProductEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        const res = await ProductService.save(dispatch, formValues);

        setBusy(false);

        if (!res) return;
        navigation.goBack();
    };

    const form = useForm<ProductEntity>({
        mode: 'onBlur',
        defaultValues: {
            id: product?.id,
            name: product?.name,
            description: product?.description,
            price: product?.price,
            tags: product?.tags,
            cost: product?.cost,
            barcode: product?.barcode,
            sku: product?.sku,
            plu: product?.plu,
            quantity: product?.quantity || 0,
            unitOfMeasure: product?.unitOfMeasure,
            trackStock: true,
            picture: product?.picture,
            productCategoryId: product?.productCategoryId,
            productBrandId: product?.productBrandId,
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

    useEffect(() => {
        const values = form.getValues();
        barcodeRef.current?.setNativeProps({ text: values.barcode });
        skuRef.current?.setNativeProps({ text: values.sku });
    }, [barcodeRef, skuRef, form]);

    return (
        <FormProvider {...form}>
            <View style={[styles.page, { padding: 25 }]}>
                <View style={[styles.row]}>
                    <View style={{ flex: 1 }}>
                        <View style={{ marginTop: 25 }}>
                            <UiFileUpload
                                prefix="products"
                                imageKey={form.getValues().picture}
                                onAssetUploaded={updatePicture}
                                onAssetRemoved={updatePicture}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 4 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <UIOverlaySelect
                                name="productCategoryId"
                                title={'Select Category'}
                                list={categories}
                                selectedId={product?.productCategoryId}
                                rules={{ required: true }}
                            />
                            <UIOverlaySelect
                                name="productBrandId"
                                title={'Select Brand'}
                                list={brands}
                                selectedId={product?.productBrandId}
                            />
                            <UIOverlaySelect
                                name="unitOfMeasure"
                                title={'Select U/of Measure'}
                                list={ums.map((u) => ({
                                    id: u.name,
                                    name: u.name,
                                }))}
                                selectedId={product?.unitOfMeasure}
                                rules={{ required: true }}
                            />
                        </View>
                        <UIVerticalSpacer size="large" />
                        <UIVerticalSpacer size="medium" />
                        <UIInput
                            name="name"
                            label='Name'
                            placeholder="Name"
                            rules={{ required: 'Name is required' }}
                        />
                        <UIInput
                            name="description"
                            placeholder="Description"
                            label='Description'
                            multiline={true}
                            numberOfLines={2}
                            style={{
                                height: 65,
                                textAlignVertical: 'top',
                            }}
                        />
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <UINumericInput
                                    keyboardType="decimal-pad"
                                    name="cost"
                                    label='Cost'
                                    allowDecimals={true}
                                    placeholder="Cost"
                                    textAlign="right"
                                    lIcon="currency-usd"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <UINumericInput
                                    keyboardType="number-pad"
                                    name="price"
                                    label='Price'
                                    allowDecimals={true}
                                    placeholder="Price"
                                    textAlign="right"
                                    rules={{
                                        required: 'Price is required',
                                    }}
                                    lIcon="currency-usd"
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    ref={barcodeRef}
                                    placeholder='UPC'
                                    label='UPC'
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    leftIcon={{
                                        name: 'barcode',
                                        type: 'material-community',
                                        color: theme.theme.colors.grey2,
                                    }}
                                    onBlur={(e) => form.setValue('barcode', e.nativeEvent.text)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    ref={skuRef}
                                    placeholder='SKU'
                                    label='SKU'
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    leftIcon={{
                                        name: 'barcode',
                                        type: 'material-community',
                                        color: theme.theme.colors.grey2,
                                    }}
                                    onBlur={(e) => {
                                        form.setValue('sku', e.nativeEvent.text)
                                    }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    ref={pluRef}
                                    placeholder='PLU'
                                    label='PLU'
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    leftIcon={{
                                        name: 'barcode',
                                        type: 'material-community',
                                        color: theme.theme.colors.grey2,
                                    }}
                                    onBlur={(e) => {
                                        form.setValue('plu', e.nativeEvent.text)
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <UIVerticalSpacer size="small" />
                <UIActions
                    busy={busy}
                    submitAction={form.handleSubmit(save)}
                    cancelAction={confirmCancel}
                />
            </View>
        </FormProvider>
    );
}

export default ProductForm;
