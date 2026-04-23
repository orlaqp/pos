import { ProductEntity } from '@pos/products/data-access';
import {
    ButtonItemType,
    UIButton,
    UIEbtRibbon,
    UIEmptyState,
} from '@pos/shared/ui-native';
import { translateWithFallback } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { EACH } from '@pos/unit-of-measures/data-access';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { View, Text, FlatList, StyleSheet, Animated, Alert } from 'react-native';
import {
    chunkProducts,
    getProductCardState,
    isProductOutOfStock,
} from './product-selection.logic';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    products: ProductEntity[];
    onSelected: (p: ButtonItemType) => void;
    onLongPress?: (p: ButtonItemType) => void;
}

type HighlightTone = 'increase' | 'decrease';

const CARD_PULSE_DURATION_MS = 180;
const CARD_FLASH_DURATION_MS = 260;
const CARD_HIGHLIGHT_CLEAR_MS = 900;

const buildQuantityMap = (products: ProductEntity[]) =>
    Object.fromEntries(products.map((product) => [product.id, Number(product.quantity || 0)]));

const toStableProductSelector = (value?: string | null) =>
    (value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function ProductSelection({
    products,
    onSelected,
    onLongPress,
}: ProductSelectionProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const localStyles = useStyles(tokens);
    const rows = useMemo(() => chunkProducts(products), [products]);
    const previousQuantitiesRef = useRef<Record<string, number>>(buildQuantityMap(products));
    const scaleMapRef = useRef<Record<string, Animated.Value>>({});
    const flashMapRef = useRef<Record<string, Animated.Value>>({});
    const clearTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const [highlightTones, setHighlightTones] = useState<Record<string, HighlightTone>>({});
    const outOfStockTitle = translateWithFallback(
        'SALES_NotAvailableTitle',
        'Not Available'
    );
    const outOfStockMessage = translateWithFallback(
        'SALES_NotAvailableMessage',
        'We do not have this product in inventory at the moment'
    );

    const handleProductSelected = (product: ButtonItemType) => {
        if (isProductOutOfStock(product as ProductEntity)) {
            Alert.alert(outOfStockTitle, outOfStockMessage);
            return;
        }

        onSelected(product);
    };

    const getScaleValue = (productId: string) => {
        if (!scaleMapRef.current[productId]) {
            scaleMapRef.current[productId] = new Animated.Value(1);
        }
        return scaleMapRef.current[productId];
    };

    const getFlashValue = (productId: string) => {
        if (!flashMapRef.current[productId]) {
            flashMapRef.current[productId] = new Animated.Value(0);
        }
        return flashMapRef.current[productId];
    };

    useEffect(() => {
        const previousQuantities = previousQuantitiesRef.current;
        const nextQuantities = buildQuantityMap(products);
        const changedProducts = products
            .map((product) => {
                const previousQuantity = previousQuantities[product.id];
                const nextQuantity = Number(product.quantity || 0);
                if (previousQuantity === undefined || previousQuantity === nextQuantity) {
                    return null;
                }

                return {
                    productId: product.id,
                    tone: nextQuantity > previousQuantity ? 'increase' : 'decrease',
                } as const;
            })
            .filter(Boolean) as Array<{ productId: string; tone: HighlightTone }>;

        previousQuantitiesRef.current = nextQuantities;

        changedProducts.forEach(({ productId, tone }) => {
            if (clearTimersRef.current[productId]) {
                clearTimeout(clearTimersRef.current[productId]);
            }

            setHighlightTones((current) => ({
                ...current,
                [productId]: tone,
            }));

            const scale = getScaleValue(productId);
            const flash = getFlashValue(productId);
            scale.stopAnimation();
            flash.stopAnimation();
            scale.setValue(1);
            flash.setValue(0);

            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.035,
                        duration: CARD_PULSE_DURATION_MS,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: CARD_PULSE_DURATION_MS,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(flash, {
                        toValue: 1,
                        duration: CARD_FLASH_DURATION_MS,
                        useNativeDriver: true,
                    }),
                    Animated.timing(flash, {
                        toValue: 0,
                        duration: CARD_FLASH_DURATION_MS,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();

            clearTimersRef.current[productId] = setTimeout(() => {
                setHighlightTones((current) => {
                    if (!current[productId]) {
                        return current;
                    }

                    const next = { ...current };
                    delete next[productId];
                    return next;
                });
                delete clearTimersRef.current[productId];
            }, CARD_HIGHLIGHT_CLEAR_MS);
        });
    }, [products]);

    useEffect(
        () => () => {
            Object.values(clearTimersRef.current).forEach((timer) => clearTimeout(timer));
        },
        []
    );

    const productBackgroundColor = (product: ProductEntity) => {
        const state = getProductCardState(product);
        if (state === 'danger')
            return styles.dangerBackground;
        if (state === 'warning')
            return styles.warningBackground;

        return styles.itemBackground;
    }

    return (
        <View style={localStyles.container}>
            {!products.length && (
                <View style={localStyles.emptyWrap}>
                    <UIEmptyState
                        text="No products found. Add products in Back Office, choose another category, or search again."
                        backgroundColor="transparent"
                        imageSize={150}
                    />
                </View>
            )}

            <View style={localStyles.listWrap}>
                <FlatList
                    testID="product-selection-list"
                    data={rows}
                    keyExtractor={(item, index) =>
                        item?.map((product) => product.id).join('-') ||
                        `product-row-${index}`
                    }
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={localStyles.listContent}
                    initialNumToRender={6}
                    maxToRenderPerBatch={6}
                    windowSize={5}
                    removeClippedSubviews={true}
                    renderItem={(info) => (
                        <View
                            style={[
                                styles.row, localStyles.row,
                            ]}
                        >
                            {info.item?.map((p) => {
                                const stableSelector = toStableProductSelector(p.name);
                                const outOfStock = isProductOutOfStock(p);

                                return (
                                <Animated.View
                                    key={p.id}
                                    style={[
                                        {
                                            ...productBackgroundColor(p),
                                            borderRadius: tokens.radii.md,
                                            marginRight: 0,
                                            marginBottom: tokens.spacing.sm,
                                            width: '32%',
                                            position: 'relative',
                                            borderWidth: 1,
                                            borderColor: tokens.colors.border,
                                            transform: [{ scale: getScaleValue(p.id) }],
                                        },
                                        outOfStock ? localStyles.outOfStockCard : null,
                                    ]}
                                >
                                    {highlightTones[p.id] ? (
                                        <Animated.View
                                            pointerEvents="none"
                                            testID={`sales-product-update-${p.id}`}
                                            style={[
                                                StyleSheet.absoluteFillObject,
                                                localStyles.updateFlash,
                                                highlightTones[p.id] === 'increase'
                                                    ? localStyles.updateFlashIncrease
                                                    : localStyles.updateFlashDecrease,
                                                {
                                                    opacity: getFlashValue(p.id),
                                                },
                                            ]}
                                        />
                                    ) : null}
                                    {p.isEBTEligible && <UIEbtRibbon />}
                                    <UIButton
                                        item={p}
                                        onSelected={handleProductSelected}
                                        onLongPress={onLongPress}
                                        maxTextLength={14}
                                        testID={
                                            stableSelector
                                                ? `sales-product-card-${stableSelector}`
                                                : undefined
                                        }
                                    >
                                        <View
                                            style={localStyles.productMeta}
                                        >
                                            <Text
                                                testID={
                                                    stableSelector
                                                        ? `sales-product-stock-value-${stableSelector}`
                                                        : p.id
                                                            ? `sales-product-stock-${p.id}`
                                                            : undefined
                                                }
                                                style={[
                                                    styles.labelText,
                                                    localStyles.stockText,
                                                    outOfStock ? localStyles.outOfStockText : null,
                                                ]}
                                            >
                                                In stock: {p.unitOfMeasure === EACH ? p.quantity : p.quantity.toFixed(2)}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.labelText,
                                                    localStyles.priceText,
                                                    outOfStock ? localStyles.outOfStockText : null,
                                                ]}
                                            >
                                                $ {p.price.toFixed(2)}
                                            </Text>
                                        </View>
                                    </UIButton>
                                </Animated.View>
                                );
                            })}
                        </View>
                    )}
                />
            </View>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        emptyWrap: {
            marginTop: 80,
        },
        listWrap: {
            flex: 1,
            paddingHorizontal: tokens.spacing.xs,
        },
        listContent: {
            paddingBottom: tokens.spacing.md,
        },
        row: {
            alignContent: 'stretch',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
        },
        productMeta: {
            marginTop: 4,
            padding: 8,
        },
        updateFlash: {
            borderRadius: tokens.radii.md,
            zIndex: 1,
        },
        updateFlashIncrease: {
            backgroundColor: 'rgba(58, 177, 125, 0.24)',
        },
        updateFlashDecrease: {
            backgroundColor: 'rgba(245, 166, 35, 0.26)',
        },
        outOfStockCard: {
            opacity: 0.42,
        },
        outOfStockText: {
            opacity: 0.82,
        },
        stockText: {
            fontWeight: '700',
            fontSize: 14,
        },
        priceText: {
            fontWeight: '800',
            fontSize: 20,
        },
    });

export default ProductSelection;
