import React, { useEffect, useState } from 'react';

import { Alert, ScrollView, StyleSheet, View, Text } from 'react-native';
import {
    UIActions,
    UICard,
    UiFileUpload,
    UIInput,
    UINumericInput,
    UIOverlaySelect,
    UIScreen,
    UIStack,
    UISwitch,
} from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { ProductEntity, ProductService } from '@pos/products/data-access';
import { RootState, useAppDispatch } from '@pos/store';
import { Product } from '@pos/shared/models';
import { selectAllBrands } from '@pos/brands/data-access';
import { selectAllUnitOfMeasures } from '@pos/unit-of-measures/data-access';
import { useTheme } from '@rneui/themed';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { getThemeColors } from '@pos/theme/native';

export interface ProductFormParams {
    [name: string]: object | undefined;
    product: Product;
}

export interface ProductFormProps {
    navigation: NativeStackNavigationProp<ProductFormParams>;
}

export function ProductForm({ navigation }: ProductFormProps) {
    const product = useSelector((state: RootState) => state.products.selected);
    const brands = useSelector(selectAllBrands);
    const ums = useSelector(selectAllUnitOfMeasures);
    const dispatch = useAppDispatch();

    const theme = useTheme();
    const tokens = useDesignTokens();
    const colors = getThemeColors(theme);
    const styles = useStyles(tokens, colors);
    const [busy, setBusy] = useState<boolean>(false);

    const updatePicture = (key: string) => {
        form.setValue('picture', key);
    };

    const save = async () => {
        setBusy(true);
        const formValues: ProductEntity = form.getValues();
        // Keep identity stable in edit mode; some form interactions can omit hidden id.
        if (!formValues.id && product?.id) {
            formValues.id = product.id;
        }
        formValues.cost = formValues.cost ? +formValues.cost : null;
        formValues.price = +formValues.price;
        
        if (!formValues.id) {
            delete formValues.id;
        }

        const res = await ProductService.save(dispatch, formValues);

        setBusy(false);

        if (!res) return;
        navigation.goBack();
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
            plu: product?.plu,
            quantity: product?.quantity || 0,
            unitOfMeasure: product?.unitOfMeasure,
            trackStock: true,
            reorderPoint: product?.reorderPoint,
            reorderQuantity: product?.reorderQuantity,
            picture: product?.picture,
            productCategoryId: product?.productCategoryId,
            productBrandId: product?.productBrandId,
            isActive: product?.isActive,
            isEBTEligible: product?.isEBTEligible ?? false,
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
        <UIScreen>
            <FormProvider {...form}>
                <View style={styles.screen}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.container}>
                            <UICard style={styles.headerCard} tone="muted" radius="lg">
                                <View style={styles.headerRow}>
                                    <View style={styles.headerTitleBlock}>
                                        <Text style={styles.headerTitle}>Product Profile</Text>
                                        <Text style={styles.headerSubtitle}>
                                            Configure catalog details, pricing and identifiers.
                                        </Text>
                                    </View>
                                    <View style={styles.headerStatusBlock}>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                form.watch('isActive')
                                                    ? styles.statusBadgeActive
                                                    : styles.statusBadgeInactive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusBadgeText,
                                                    form.watch('isActive')
                                                        ? styles.statusBadgeTextActive
                                                        : styles.statusBadgeTextInactive,
                                                ]}
                                            >
                                                {form.watch('isActive') ? 'Available' : 'Hidden'}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                form.watch('isEBTEligible')
                                                    ? styles.statusBadgeEbt
                                                    : styles.statusBadgeDefault,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusBadgeText,
                                                    form.watch('isEBTEligible')
                                                        ? styles.statusBadgeTextEbt
                                                        : styles.statusBadgeTextDefault,
                                                ]}
                                            >
                                                {form.watch('isEBTEligible')
                                                    ? 'EBT Eligible'
                                                    : 'Regular Product'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Catalog</Text>
                                <View style={styles.catalogRow}>
                                    <View style={styles.imageColumn}>
                                        <UiFileUpload
                                            prefix="products"
                                            imageKey={form.getValues().picture}
                                            onAssetUploaded={updatePicture}
                                            onAssetRemoved={updatePicture}
                                        />
                                    </View>
                                    <View style={styles.catalogFieldsColumn}>
                                        <View style={styles.controlsGrid}>
                                            <View style={styles.controlsColumn}>
                                                <View style={styles.overlaySelectSlot}>
                                                    <UIOverlaySelect
                                                        name="productBrandId"
                                                        title="Select Brand"
                                                        list={brands}
                                                        selectedId={product?.productBrandId}
                                                    />
                                                </View>
                                                <View style={styles.overlaySelectSlot}>
                                                    <UIOverlaySelect
                                                        name="unitOfMeasure"
                                                        title="Select U/of Measure"
                                                        list={ums.map((u) => ({
                                                            id: u.name,
                                                            name: u.name,
                                                        }))}
                                                        selectedId={product?.unitOfMeasure}
                                                        rules={{ required: true }}
                                                    />
                                                </View>
                                            </View>
                                            <View style={styles.switchesColumn}>
                                                <View style={styles.toggleItem}>
                                                    <Text style={styles.toggleLabel}>Available for sale</Text>
                                                    <View style={styles.toggleSwitchWrap}>
                                                        <UISwitch name="isActive" />
                                                    </View>
                                                </View>
                                                <View style={styles.toggleItem}>
                                                    <Text style={styles.toggleLabel}>EBT eligible</Text>
                                                    <View style={styles.toggleSwitchWrap}>
                                                        <UISwitch name="isEBTEligible" />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Details</Text>
                                <UIStack spacing="sm">
                                    <UIInput
                                        name="name"
                                        label="Name"
                                        placeholder="Name"
                                        rules={{ required: 'Name is required' }}
                                    />
                                    <UIInput
                                        name="description"
                                        placeholder="Description"
                                        label="Description"
                                        multiline
                                        numberOfLines={2}
                                        style={styles.descriptionInput}
                                    />
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <UINumericInput
                                                keyboardType="decimal-pad"
                                                name="cost"
                                                label="Cost"
                                                allowDecimals
                                                placeholder="Cost"
                                                textAlign="right"
                                                lIcon="currency-usd"
                                            />
                                        </View>
                                        <View style={styles.columnLast}>
                                            <UINumericInput
                                                keyboardType="number-pad"
                                                name="price"
                                                label="Price"
                                                allowDecimals
                                                placeholder="Price"
                                                textAlign="right"
                                                rules={{
                                                    required: 'Price is required',
                                                }}
                                                lIcon="currency-usd"
                                            />
                                        </View>
                                    </View>
                                </UIStack>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Identifiers</Text>
                                <View style={styles.row}>
                                    <View style={styles.column}>
                                        <UIInput
                                            name="barcode"
                                            placeholder="UPC"
                                            label="UPC"
                                            lIcon="barcode"
                                        />
                                    </View>
                                    <View style={styles.column}>
                                        <UIInput
                                            name="sku"
                                            placeholder="SKU"
                                            label="SKU"
                                            lIcon="barcode"
                                        />
                                    </View>
                                    <View style={styles.columnLast}>
                                        <UIInput
                                            name="plu"
                                            placeholder="PLU"
                                            label="PLU"
                                            lIcon="barcode"
                                        />
                                    </View>
                                </View>
                            </UICard>
                        </View>
                    </ScrollView>
                    <View style={styles.actionBar}>
                        <UICard tone="muted" style={styles.actionBarCard}>
                            <UIActions
                                busy={busy}
                                submitAction={form.handleSubmit(save)}
                                cancelAction={confirmCancel}
                            />
                        </UICard>
                    </View>
                </View>
            </FormProvider>
        </UIScreen>
    );
}

const useStyles = (
    tokens: ReturnType<typeof useDesignTokens>,
    colors: ReturnType<typeof getThemeColors>
) =>
    StyleSheet.create({
        screen: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: tokens.spacing.xl,
            paddingTop: tokens.spacing.lg,
            paddingBottom: tokens.spacing.xl,
            alignItems: 'center',
        },
        container: {
            width: '100%',
            maxWidth: 1240,
        },
        headerCard: {
            marginBottom: tokens.spacing.lg,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTitleBlock: {
            flex: 1,
            paddingRight: tokens.spacing.lg,
        },
        headerTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 26,
            fontWeight: '700',
        },
        headerSubtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
        },
        headerStatusBlock: {
            alignItems: 'flex-end',
        },
        statusBadge: {
            borderRadius: tokens.radii.xl,
            borderWidth: 1,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
            marginBottom: tokens.spacing.xs,
        },
        statusBadgeActive: {
            backgroundColor: `${tokens.colors.success}22`,
            borderColor: `${tokens.colors.success}66`,
        },
        statusBadgeInactive: {
            backgroundColor: `${tokens.colors.danger}22`,
            borderColor: `${tokens.colors.danger}66`,
        },
        statusBadgeEbt: {
            backgroundColor: `${tokens.colors.accent}22`,
            borderColor: `${tokens.colors.accent}66`,
        },
        statusBadgeDefault: {
            backgroundColor: `${tokens.colors.textMuted}22`,
            borderColor: `${tokens.colors.textMuted}66`,
        },
        statusBadgeText: {
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
        },
        statusBadgeTextActive: {
            color: tokens.colors.success,
        },
        statusBadgeTextInactive: {
            color: tokens.colors.danger,
        },
        statusBadgeTextEbt: {
            color: tokens.colors.accent,
        },
        statusBadgeTextDefault: {
            color: tokens.colors.textMuted,
        },
        sectionCard: {
            marginBottom: tokens.spacing.lg,
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 19,
            fontWeight: '700',
            marginBottom: tokens.spacing.sm,
        },
        catalogRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        imageColumn: {
            width: 230,
            marginRight: tokens.spacing.lg,
            paddingTop: tokens.spacing.md,
            paddingLeft: tokens.spacing.sm,
            paddingBottom: tokens.spacing.sm,
        },
        catalogFieldsColumn: {
            flex: 1,
        },
        controlsGrid: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        controlsColumn: {
            flex: 1.4,
            marginLeft: -10,
            marginRight: tokens.spacing.md,
        },
        switchesColumn: {
            flex: 1,
            justifyContent: 'center',
            paddingTop: tokens.spacing.xs,
        },
        overlaySelectSlot: {
            minWidth: 240,
            marginBottom: tokens.spacing.xs,
        },
        toggleItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 44,
            marginBottom: tokens.spacing.xs,
        },
        toggleLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 16,
            fontWeight: '600',
        },
        toggleSwitchWrap: {
            marginLeft: tokens.spacing.sm,
        },
        descriptionInput: {
            height: 70,
            textAlignVertical: 'top',
        },
        row: {
            flexDirection: 'row',
        },
        column: {
            flex: 1,
            marginRight: tokens.spacing.md,
        },
        columnLast: {
            flex: 1,
        },
        inputContainerStyle: {
            marginTop: 10,
            borderRadius: 5,
            borderBottomWidth: 0,
            paddingLeft: 10,
            backgroundColor: colors.grey5,
        },
        inputStyle: {
            color: colors.grey1,
            paddingHorizontal: 10,
            textAlign: 'right',
        },
        actionBar: {
            paddingHorizontal: tokens.spacing.xl,
            paddingBottom: tokens.spacing.md,
            paddingTop: tokens.spacing.xs,
        },
        actionBarCard: {
            maxWidth: 1240,
            alignSelf: 'center',
            width: '100%',
            borderRadius: tokens.radii.lg,
        },
    });

export default ProductForm;
