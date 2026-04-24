import { selectBrand } from '@pos/brands/data-access';
import { selectProduct } from '@pos/products/data-access';
import { CartItem } from '@pos/sales/data-access';
import { UICard, UIEbtRibbon, UIS3Image } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { EACH } from '@pos/unit-of-measures/data-access';
import { Button, Input, useTheme } from '@rneui/themed';
import { translateWithFallback } from '@pos/shared/utils';
import React, { useEffect, useRef, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Alert,
    useWindowDimensions,
    Pressable,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
    buildCartUpsertItem,
    calculateLinePrice,
    hasEnoughInventory,
    isQuantityInputValidForUnit,
    toSanitizedQuantityNumber,
} from './product-details.logic';

/* eslint-disable-next-line */
export interface ProductDetailsProps {
    item: CartItem;
    upsertCart: (item: CartItem) => void;
    enforceSalesBasedOnInventory?: boolean;
}

export function ProductDetails({ item, upsertCart, enforceSalesBasedOnInventory }: ProductDetailsProps) {
    const t = translateWithFallback;
    const theme = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const styles = useStyles(windowWidth);
    const ref = useRef<TextInput>(null);
    const [quantity, setQuantity] = useState<string>(
        item.quantity === 0 ? '' : item.quantity.toString()
    );
    const [price, setPrice] = useState<number>(item.product.price);
    const product = useSelector(selectProduct(item.product.id));
    const brand = useSelector(selectBrand(product?.productBrandId));
    const each = item.product.unitOfMeasure === EACH;

    const validateInfo = () => {
        const normalizedQuantity = each && toSanitizedQuantityNumber(quantity, true) <= 0
            ? '1'
            : quantity;

        if (normalizedQuantity !== quantity) {
            setQuantity(normalizedQuantity);
        }

        if (
            !hasEnoughInventory(
                enforceSalesBasedOnInventory,
                product?.quantity,
                normalizedQuantity
            )
        ) {
            Alert.alert(
                t('SALES_CannotSellQuantityTitle', 'Cannot sell this much'),
                t(
                    'SALES_CannotSellQuantityMessage',
                    'There is not enough inventory to fulfill your request'
                )
            );
            return;
        }

        upsertCart(buildCartUpsertItem(item, normalizedQuantity));
    }

    useEffect(() => {
        setPrice(calculateLinePrice(quantity, item.product.price, each));
    }, [each, item, quantity]);

    useEffect(() => {
        if (!each) {
            ref.current?.focus();
        }
    }, [each]);

    const numericQuantity = toSanitizedQuantityNumber(quantity, each) > 0
        ? toSanitizedQuantityNumber(quantity, each)
        : 1;

    const decrementQuantity = () => {
        setQuantity(Math.max(1, numericQuantity - 1).toString());
    };

    const incrementQuantity = () => {
        setQuantity((numericQuantity + 1).toString());
    };

    return (
        <View style={styles.productDetailsContainer} testID="sales-product-details-screen">
            <View style={styles.dialogFrame}>
                <View style={styles.headerBlock}>
                    <Text style={styles.eyebrow}>
                        {t('SALES_ProductDetails', 'Product details')}
                    </Text>
                    <Text style={styles.headerTitle}>
                        {t('SALES_ReviewQuantityAndLineValue', 'Review quantity and line value')}
                    </Text>
                    <Text style={styles.headerHint}>
                        {t(
                            'SALES_ProductDetailsHint',
                            'Keep spacing clear while adjusting the order line before confirming it in the cart.'
                        )}
                    </Text>
                </View>

                <UICard style={styles.heroCard} tone="muted" padding="md" radius="lg">
                    {item.product.isEBTEligible && <UIEbtRibbon top={2} right={2} />}
                    <View style={styles.heroRow}>
                        <View style={styles.pictureWrap}>
                            <UIS3Image
                                s3Key={product?.picture}
                                width={styles.pictureSize.width}
                                height={styles.pictureSize.height}
                                factor={0.5}
                            />
                        </View>
                        <View style={styles.metaWrap}>
                            <Text style={styles.brandText}>
                                {brand?.name || t('PRODUCT_Unbranded', 'Unbranded')}
                            </Text>
                            <Text style={styles.productName} numberOfLines={2}>
                                {item.product.name}
                            </Text>
                            <Text style={styles.descriptionText} numberOfLines={3}>
                                {product?.description || t('COMMON_NoDescription', 'No description')}
                            </Text>
                            <Text style={styles.unitHint}>
                                {t('SALES_SoldByUnit', 'Sold by {{unit}}', {
                                    unit: item.product.unitOfMeasure,
                                })}
                            </Text>
                            <View style={styles.detailPillRow}>
                                <View style={styles.detailPill}>
                                    <Text style={styles.detailPillLabel}>
                                        {t('SALES_BasePrice', 'Base price')}
                                    </Text>
                                    <Text style={styles.detailPillValue}>
                                        ${item.product.price.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.detailPill}>
                                    <Text style={styles.detailPillLabel}>
                                        {t('COMMON_Unit', 'Unit')}
                                    </Text>
                                    <Text style={styles.detailPillValue}>
                                        {item.product.unitOfMeasure}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </UICard>

                <View style={styles.summaryCard}>
                    <View style={styles.pricePanel}>
                        <Text style={styles.sectionEyebrow}>
                            {t('SALES_LineTotal', 'Line total')}
                        </Text>
                        <View style={styles.priceWrap}>
                            <Text style={styles.price}>$ {price?.toFixed(2)}</Text>
                            <Text style={styles.priceLabel}>
                                {t(
                                    'SALES_CurrentValueBasedOnQuantity',
                                    'Current value based on the quantity below'
                                )}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.quantityWrap}>
                        <Text style={styles.sectionEyebrow}>
                            {t('COMMON_Quantity', 'Quantity')}
                        </Text>
                        {each && (
                            <View style={styles.quantityStepper}>
                                <Pressable
                                    testID="product-details-decrement"
                                    onPress={decrementQuantity}
                                    style={styles.quantityButtonLeft}
                                >
                                    <Text style={styles.quantityButtonTextDark}>-</Text>
                                </Pressable>
                                <View style={styles.quantityValueWrap}>
                                    <TextInput
                                        ref={ref}
                                        testID="product-details-quantity-input"
                                        value={quantity}
                                        keyboardType="number-pad"
                                        textAlign="center"
                                        selectTextOnFocus
                                        style={styles.quantityValueInput}
                                        onBlur={() => {
                                            if (toSanitizedQuantityNumber(quantity, true) <= 0) {
                                                setQuantity('1');
                                            }
                                        }}
                                        onChangeText={(text) => {
                                            if (!isQuantityInputValidForUnit(text, true)) {
                                                return;
                                            }

                                            setQuantity(text);
                                        }}
                                    />
                                    <Text style={styles.quantityLabel}>
                                        {t('SALES_UnitsInThisLine', 'Units in this line')}
                                    </Text>
                                </View>
                                <Pressable
                                    testID="product-details-increment"
                                    onPress={incrementQuantity}
                                    style={styles.quantityButtonRight}
                                >
                                    <Text style={styles.quantityButtonTextLight}>+</Text>
                                </Pressable>
                            </View>
                        )}
                        {!each && (
                            <View style={styles.weightRow}>
                                <Input
                                    ref={ref as any}
                                    testID="product-details-quantity-input"
                                    value={quantity.toString()}
                                    placeholder={t('SALES_WeightPlaceholder', 'Weight ...')}
                                    keyboardType="decimal-pad"
                                    style={{ fontSize: 32 }}
                                    textAlign="center"
                                    onChangeText={(text) => {
                                        if (!isQuantityInputValidForUnit(text, false))
                                            return;

                                        setQuantity(text);
                                    }}
                                />
                                <Text
                                    style={styles.unitOfMeasure}
                                >{` (${item.product.unitOfMeasure})`}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <Button
                    testID="sales-product-details-submit"
                    containerStyle={styles.ctaContainer}
                    type="solid"
                    title={
                        item.identifier
                            ? t('CART_UpdateCart', 'Update cart')
                            : t('CART_AddToCart', 'Add to cart')
                    }
                    onPress={validateInfo}
                />
            </View>
        </View>
    );
}

const useStyles = (windowWidth: number) => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();
    const tokens = useDesignTokens();
    const compactLayout = windowWidth < 900;
    const contentWidth = compactLayout ? 420 : 520;
    const pictureWrapSize = compactLayout ? 132 : 164;
    const quantityWidth = compactLayout ? 220 : 280;
    const nameSize = compactLayout ? 28 : 34;
    const priceSize = compactLayout ? 44 : 56;
    const unitSize = compactLayout ? 20 : 24;

    return {
        pictureSize: {
            width: pictureWrapSize,
            height: pictureWrapSize,
        },
        ...sharedStyles,
        ...StyleSheet.create({
            productDetailsContainer: {
                width: '100%',
                alignItems: 'center',
                paddingVertical: compactLayout ? tokens.spacing.md : tokens.spacing.lg,
            },
            dialogFrame: {
                width: '100%',
                maxWidth: contentWidth,
                minWidth: compactLayout ? 380 : 460,
                alignSelf: 'center',
            },
            headerBlock: {
                marginBottom: tokens.spacing.md,
                paddingHorizontal: tokens.spacing.xs,
            },
            eyebrow: {
                color: tokens.colors.accent,
                fontSize: 13,
                fontWeight: '800',
                letterSpacing: 1.8,
                textTransform: 'uppercase',
                marginBottom: tokens.spacing.xs,
            },
            headerTitle: {
                color: tokens.colors.textPrimary,
                fontSize: compactLayout ? 28 : 34,
                fontWeight: '800',
                lineHeight: compactLayout ? 34 : 40,
            },
            headerHint: {
                color: tokens.colors.textSecondary,
                fontSize: 16,
                lineHeight: 24,
                marginTop: tokens.spacing.xs,
            },
            heroCard: {
                width: '100%',
            },
            heroRow: {
                flexDirection: 'row',
                alignItems: 'flex-start',
            },
            pictureWrap: {
                width: pictureWrapSize,
                height: pictureWrapSize,
                borderRadius: tokens.radii.lg,
                overflow: 'hidden',
                backgroundColor: tokens.colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: tokens.spacing.md,
                flexShrink: 0,
            },
            metaWrap: {
                flex: 1,
                minWidth: 0,
                justifyContent: 'center',
            },
            brandText: {
                color: tokens.colors.textMuted,
                fontSize: 14,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: tokens.spacing.sm,
            },
            productName: {
                color: tokens.colors.textPrimary,
                fontSize: nameSize,
                fontWeight: '800',
                lineHeight: compactLayout ? 34 : 40,
            },
            descriptionText: {
                color: tokens.colors.textSecondary,
                fontSize: 17,
                lineHeight: 24,
                marginTop: tokens.spacing.sm,
            },
            unitHint: {
                color: tokens.colors.textMuted,
                fontSize: 14,
                fontWeight: '600',
                marginTop: tokens.spacing.md,
            },
            detailPillRow: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: tokens.spacing.sm,
                marginTop: tokens.spacing.md,
            },
            detailPill: {
                minWidth: compactLayout ? 108 : 124,
                borderRadius: tokens.radii.md,
                borderWidth: 1,
                borderColor: tokens.colors.border,
                backgroundColor: tokens.colors.surface,
                paddingHorizontal: tokens.spacing.sm,
                paddingVertical: tokens.spacing.sm,
            },
            detailPillLabel: {
                color: tokens.colors.textMuted,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 4,
            },
            detailPillValue: {
                color: tokens.colors.textPrimary,
                fontSize: 16,
                fontWeight: '700',
            },
            summaryCard: {
                width: '100%',
                marginTop: tokens.spacing.lg,
                paddingVertical: tokens.spacing.lg,
                paddingHorizontal: tokens.spacing.lg,
                borderRadius: tokens.radii.lg,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.colors.border,
            },
            sectionEyebrow: {
                color: tokens.colors.textMuted,
                fontSize: 12,
                fontWeight: '800',
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                marginBottom: tokens.spacing.sm,
            },
            pricePanel: {
                alignItems: 'center',
                paddingBottom: tokens.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: tokens.colors.border,
            },
            quantityWrap: {
                width: '100%',
                alignItems: 'center',
                marginTop: tokens.spacing.lg,
            },
            quantityStepper: {
                width: quantityWidth,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: compactLayout ? 64 : 72,
            },
            quantityButtonLeft: {
                width: compactLayout ? 84 : 96,
                height: compactLayout ? 64 : 72,
                borderRadius: tokens.radii.md,
                backgroundColor: theme.theme.colors.grey4,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                flexShrink: 0,
                overflow: 'hidden',
            },
            quantityButtonRight: {
                width: compactLayout ? 84 : 96,
                height: compactLayout ? 64 : 72,
                borderRadius: tokens.radii.md,
                backgroundColor: theme.theme.colors.success,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                flexShrink: 0,
                overflow: 'hidden',
            },
            quantityValueWrap: {
                minWidth: 88,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: tokens.spacing.sm,
            },
            quantityButtonTextDark: {
                color: theme.theme.colors.black,
                fontSize: 34,
                fontWeight: '700',
                lineHeight: compactLayout ? 38 : 42,
            },
            quantityButtonTextLight: {
                color: theme.theme.colors.white,
                fontSize: 34,
                fontWeight: '700',
                lineHeight: compactLayout ? 38 : 42,
            },
            quantityValue: {
                color: theme.theme.colors.grey0,
                fontSize: compactLayout ? 32 : 38,
                fontWeight: '700',
            },
            quantityValueInput: {
                color: theme.theme.colors.grey0,
                fontSize: compactLayout ? 32 : 38,
                fontWeight: '700',
                minWidth: compactLayout ? 72 : 88,
                paddingVertical: 0,
            },
            quantityLabel: {
                color: tokens.colors.textMuted,
                fontSize: 13,
                fontWeight: '600',
                marginTop: tokens.spacing.xs,
            },
            weightRow: {
                width: quantityWidth,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            },
            price: {
                fontSize: priceSize,
                fontWeight: '800',
                color: theme.theme.colors.grey0,
            },
            priceLabel: {
                color: tokens.colors.textSecondary,
                fontSize: 14,
                fontWeight: '600',
                marginTop: tokens.spacing.xs,
                textAlign: 'center',
                maxWidth: compactLayout ? 220 : 260,
            },
            priceWrap: {
                alignItems: 'center',
            },
            unitOfMeasure: {
                fontSize: unitSize,
                fontWeight: 'bold',
                color: theme.theme.colors.grey3,
                lineHeight: compactLayout ? 40 : 48,
            },
            ctaContainer: {
                marginTop: tokens.spacing.lg,
                width: '100%',
            },
        }),
    };
};

export default ProductDetails;
