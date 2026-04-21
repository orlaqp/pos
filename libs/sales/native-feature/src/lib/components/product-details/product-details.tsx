import { selectBrand } from '@pos/brands/data-access';
import { selectProduct } from '@pos/products/data-access';
import { CartItem } from '@pos/sales/data-access';
import { UICard, UIEbtRibbon, UIS3Image } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { EACH } from '@pos/unit-of-measures/data-access';
import { Button, Input, useTheme } from '@rneui/themed';
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
            Alert.alert('Cannot sale this much', 'There is not enough inventory to fulfill your request');
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
        <View style={styles.productDetailsContainer}>
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
                        <Text style={styles.brandText}>{brand?.name || 'Unbranded'}</Text>
                        <Text style={styles.productName} numberOfLines={2}>
                            {item.product.name}
                        </Text>
                        <Text style={styles.descriptionText} numberOfLines={3}>
                            {product?.description || 'No description'}
                        </Text>
                        <Text style={styles.unitHint}>
                            Sold by {item.product.unitOfMeasure}
                        </Text>
                    </View>
                </View>
            </UICard>
            <View style={styles.summaryCard}>
                <View style={styles.priceWrap}>
                    <Text style={styles.price}>$ {price?.toFixed(2)}</Text>
                    <Text style={styles.priceLabel}>Current line total</Text>
                </View>
                <View style={styles.quantityWrap}>
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
                            <Text style={styles.quantityLabel}>Quantity</Text>
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
                            placeholder="Weight ..."
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
                containerStyle={styles.ctaContainer}
                type="solid"
                title={item.identifier ? 'Update cart' : 'Add to cart'}
                onPress={validateInfo}
            />
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
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                maxWidth: contentWidth,
                minWidth: compactLayout ? 380 : 460,
                alignSelf: 'center',
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
            summaryCard: {
                width: '100%',
                marginTop: tokens.spacing.lg,
                paddingVertical: tokens.spacing.md,
                paddingHorizontal: tokens.spacing.md,
                borderRadius: tokens.radii.lg,
                backgroundColor: tokens.colors.surface,
            },
            quantityWrap: {
                width: '100%',
                alignItems: 'center',
                marginTop: tokens.spacing.md,
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
