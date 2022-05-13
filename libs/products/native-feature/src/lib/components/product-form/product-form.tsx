import React, { useEffect, useState } from 'react';

import { Alert, View, Text } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import {
    UIActions,
    UiFileUpload,
    UIInput,
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
import {
    CategoryEntity,
    fetchCategories,
    selectAllCategories,
    selectLoadingStatus as categorySelectLoadingStatus,
} from '@pos/categories/data-access';
import {
    BrandEntity,
    fetchBrands,
    selectAllBrands,
    selectLoadingStatus as brandSelectLoadingStatus,
} from '@pos/brands/data-access';
import {
    fetchUnitOfMeasures,
    selectAllUnitOfMeasures,
    selectLoadingStatus as umSelectLadingStatus,
    UnitOfMeasureEntity,
} from '@pos/unit-of-measures/data-access';
import { Switch } from '@rneui/themed';

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
    const catLoadingStatus = useSelector(categorySelectLoadingStatus);
    const brands = useSelector(selectAllBrands);
    const brLoadingStatus = useSelector(brandSelectLoadingStatus);
    const ums = useSelector(selectAllUnitOfMeasures);
    const umLoadingStatus = useSelector(umSelectLadingStatus);
    const dispatch = useDispatch();

    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    useEffect(() => {
        if (catLoadingStatus === 'not loaded') dispatch(fetchCategories());
    }, [catLoadingStatus, dispatch]);

    useEffect(() => {
        if (brLoadingStatus === 'not loaded') dispatch(fetchBrands());
    }, [brLoadingStatus, dispatch]);

    useEffect(() => {
        if (umLoadingStatus === 'not loaded') dispatch(fetchUnitOfMeasures());
    }, [umLoadingStatus, dispatch]);

    const updatePicture = (key: string) => {
        form.setValue('picture', key);
    };

    const save = async () => {
        debugger;
        setBusy(true);
        const formValues: ProductEntity = form.getValues();

        if (!formValues.id) {
            delete formValues.id;
        }

        await ProductService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm<ProductEntity>({
        mode: 'onChange',
        defaultValues: {
            id: product?.id,
            name: product?.name,
            description: product?.description,
            price: product?.price,
            tags: product?.tags,
            cost: product?.cost,
            barcode: product?.barcode,
            sku: product?.sku,
            trackStock: product?.trackStock,
            picture: product?.picture,
            category: product?.category,
            unitOfMeasure: product?.unitOfMeasure,
            brand: product?.brand,
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

    return (
        <FormProvider {...form}>
            <View style={[styles.page, { padding: 25 }]}>
                <View style={[styles.row]}>
                    <View style={{ flex: 1 }}>
                        <View style={{ marginTop: 25 }}>
                            <UiFileUpload
                                imageKey={form.getValues().picture}
                                onAssetUploaded={updatePicture}
                                onAssetRemoved={updatePicture}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 4 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <UIOverlaySelect
                                name='productCategoryId'
                                title={'Select Category'}
                                list={categories}
                                selectedId={product?.productCategoryId}
                            />
                            <UIOverlaySelect
                                name='productBrandId'
                                title={'Select Brand'}
                                list={brands}
                                selectedId={product?.productBrandId}
                            />
                            <UIOverlaySelect
                                name='productUnitOfMeasureId'
                                title={'Select U/of Measure'}
                                list={ums}
                                selectedId={product?.productUnitOfMeasureId}
                            />
                        </View>
                        <UIVerticalSpacer size="large" />
                        <View style={{ flexDirection: 'row-reverse' }}>
                            <UISwitch name='trackStock' label='Enable inventory tracking ?' />
                        </View>
                        <UIVerticalSpacer size="medium" />
                        <UIInput
                            name="name"
                            placeholder="Name"
                            rules={{ required: 'Name is required' }}
                        />
                        <UIInput
                            name="description"
                            placeholder="Description"
                            multiline={true}
                            numberOfLines={2}
                            style={{
                                height: 65,
                                textAlignVertical: 'top',
                            }}
                        />
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <UIInput
                                    keyboardType='decimal-pad'
                                    name="cost"
                                    placeholder="Cost"
                                    textAlign="right"
                                    lIcon="currency-usd"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <UIInput
                                    keyboardType='decimal-pad'
                                    name="price"
                                    placeholder="Price"
                                    textAlign="right"
                                    rules={{ required: 'Price is required' }}
                                    lIcon="currency-usd"
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <UIInput
                                    name="barcode"
                                    placeholder="Barcode"
                                    textAlign="right"
                                    lIcon="barcode"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <UIInput
                                    name="sku"
                                    placeholder="SKU"
                                    textAlign="right"
                                    lIcon="barcode"
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
