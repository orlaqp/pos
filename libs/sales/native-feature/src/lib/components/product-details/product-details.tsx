import { selectBrand } from '@pos/brands/data-access';
import { selectProduct } from '@pos/products/data-access';
import { CartItem } from '@pos/sales/data-access';
import { UICard, UIEbtRibbon, UIS3Image } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { EACH } from '@pos/unit-of-measures/data-access';
import { Button, Input, useTheme } from '@rneui/themed';
import React, { useEffect, useRef, useState } from 'react';

import { View, Text, StyleSheet, TextInput, Alert, useWindowDimensions } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import { useSelector } from 'react-redux';
import {
    buildCartUpsertItem,
    calculateLinePrice,
    hasEnoughInventory,
    isQuantityInputValid,
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
        if (
            !hasEnoughInventory(
                enforceSalesBasedOnInventory,
                product?.quantity,
                quantity
            )
        ) {
            Alert.alert('Cannot sale this much', 'There is not enough inventory to fulfill your request');
            return;
        }

        upsertCart(buildCartUpsertItem(item, quantity));
    }

    useEffect(() => {
        setPrice(calculateLinePrice(quantity, item.product.price));
    }, [item, quantity]);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <View style={styles.productDetailsContainer}>
            <UICard style={styles.heroCard} tone="muted" padding="md" radius="lg">
                {item.product.isEBTEligible && <UIEbtRibbon top={2} right={2} />}
                <View style={styles.heroRow}>
                    <View style={styles.pictureWrap}>
                        <UIS3Image
                            s3Key={product?.picture}
                            width={96}
                            height={96}
                            factor={0.5}
                        />
                    </View>
                    <View style={styles.metaWrap}>
                        <Text style={styles.brandText}>{brand?.name || 'Unbranded'}</Text>
                        <Text style={styles.productName}>{item.product.name}</Text>
                        <Text style={styles.descriptionText} numberOfLines={2}>
                            {product?.description || 'No description'}
                        </Text>
                    </View>
                </View>
            </UICard>
            <View style={styles.quantityWrap}>
                {each && (
                    <NumericInput
                        type="plus-minus"
                        valueType="integer"
                        value={+quantity}
                        onChange={(val) => setQuantity(val.toString())}
                        borderColor="transparent"
                        textColor={theme.theme.colors.grey1}
                        iconSize={20}
                        totalHeight={50}
                        leftButtonBackgroundColor={theme.theme.colors.grey4}
                        rightButtonBackgroundColor={theme.theme.colors.success}
                        minValue={1}
                        step={1}
                        rounded={true}
                    />
                )}
                {!each && (
                    <View style={styles.weightRow}>
                        <Input
                            ref={ref}
                            value={quantity.toString()}
                            placeholder="Weight ..."
                            keyboardType="decimal-pad"
                            style={{ fontSize: 32 }}
                            textAlign="center"
                            onChangeText={(text) => {
                                if (!isQuantityInputValid(text))
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
            <View style={styles.priceWrap}>
                <Text style={styles.price}>$ {price?.toFixed(2)}</Text>
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
    const contentWidth = compactLayout ? 300 : 340;
    const pictureWrapSize = compactLayout ? 92 : 108;
    const quantityWidth = compactLayout ? 168 : 200;
    const nameSize = compactLayout ? 20 : 24;
    const priceSize = compactLayout ? 36 : 44;
    const unitSize = compactLayout ? 20 : 24;

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            productDetailsContainer: {
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                maxWidth: contentWidth,
                minWidth: compactLayout ? 280 : 320,
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
                borderRadius: tokens.radii.md,
                overflow: 'hidden',
                backgroundColor: tokens.colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: tokens.spacing.sm,
                flexShrink: 0,
            },
            metaWrap: {
                flex: 1,
                minWidth: 0,
            },
            brandText: {
                color: tokens.colors.textMuted,
                fontSize: 13,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                marginBottom: tokens.spacing.xs,
            },
            productName: {
                color: tokens.colors.textPrimary,
                fontSize: nameSize,
                fontWeight: '800',
                lineHeight: compactLayout ? 28 : 34,
            },
            descriptionText: {
                color: tokens.colors.textSecondary,
                fontSize: 14,
                marginTop: tokens.spacing.xs,
            },
            quantityWrap: {
                marginTop: tokens.spacing.lg,
                width: '100%',
                alignItems: 'center',
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
            priceWrap: {
                marginTop: tokens.spacing.lg,
                flexDirection: 'row',
                alignItems: 'flex-end',
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
