import { ProductEntity } from '@pos/products/data-access';
import {
    UIEmptyState,
    UIS3Image,
} from '@pos/shared/ui-native';
import { translateWithFallback } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Animated,
    Alert,
    Pressable,
} from 'react-native';
import {
    chunkProducts,
    getProductCardState,
    getProductStockBadgeTone,
    getProductStockLabel,
    isProductOutOfStock,
} from './product-selection.logic';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    products: ProductEntity[];
    onSelected: (p: ProductEntity) => void;
    onLongPress?: (p: ProductEntity) => void;
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
    const pressClearTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const [highlightTones, setHighlightTones] = useState<Record<string, HighlightTone>>({});
    const [activeProductId, setActiveProductId] = useState<string | null>(null);
    const outOfStockTitle = translateWithFallback(
        'SALES_NotAvailableTitle',
        'Not Available'
    );
    const outOfStockMessage = translateWithFallback(
        'SALES_NotAvailableMessage',
        'We do not have this product in inventory at the moment'
    );
    const stockLabelInStock = translateWithFallback('SALES_ProductCardInStock', 'In stock');
    const stockLabelLowStock = translateWithFallback('SALES_ProductCardLowStock', 'Low stock');
    const stockLabelOutOfStock = translateWithFallback(
        'SALES_ProductCardOutOfStock',
        'Out of stock'
    );
    const stockLabelLeft = translateWithFallback('SALES_ProductCardLeft', 'left');
    const priceCaption = translateWithFallback('SALES_ProductCardPrice', 'Price');
    const productMetaWithPhoto = translateWithFallback(
        'SALES_ProductCardPhotoReady',
        'Photo ready'
    );
    const productMetaCatalogItem = translateWithFallback(
        'SALES_ProductCardCatalogItem',
        'Catalog item'
    );

    const handleProductSelected = (product: ProductEntity) => {
        if (isProductOutOfStock(product)) {
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
            Object.values(pressClearTimersRef.current).forEach((timer) => clearTimeout(timer));
        },
        []
    );

    const markProductActive = (productId: string) => {
        if (pressClearTimersRef.current[productId]) {
            clearTimeout(pressClearTimersRef.current[productId]);
        }

        setActiveProductId(productId);
    };

    const releaseProductActive = (productId: string, linger = 140) => {
        if (pressClearTimersRef.current[productId]) {
            clearTimeout(pressClearTimersRef.current[productId]);
        }

        pressClearTimersRef.current[productId] = setTimeout(() => {
            setActiveProductId((current) => (current === productId ? null : current));
            delete pressClearTimersRef.current[productId];
        }, linger);
    };

    const getCardBadgeStyle = (product: ProductEntity) => {
        const tone = getProductStockBadgeTone(product);
        if (tone === 'danger') {
            return [localStyles.stockBadge, localStyles.stockBadgeDanger];
        }
        if (tone === 'warning') {
            return [localStyles.stockBadge, localStyles.stockBadgeWarning];
        }

        return [localStyles.stockBadge, localStyles.stockBadgeNeutral];
    };

    const getCardBadgeTextStyle = (product: ProductEntity) => {
        const tone = getProductStockBadgeTone(product);
        if (tone === 'danger') {
            return [localStyles.stockBadgeText, localStyles.stockBadgeTextDanger];
        }
        if (tone === 'warning') {
            return [localStyles.stockBadgeText, localStyles.stockBadgeTextWarning];
        }

        return [localStyles.stockBadgeText, localStyles.stockBadgeTextNeutral];
    };

    const getCardStateStyle = (product: ProductEntity) => {
        const state = getProductCardState(product);
        if (state === 'danger') {
            return localStyles.cardShellDanger;
        }
        if (state === 'warning') {
            return localStyles.cardShellWarning;
        }

        return null;
    };

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
                                const isActive = activeProductId === p.id;
                                const stockLabel = getProductStockLabel(p, {
                                    inStock: stockLabelInStock,
                                    lowStock: stockLabelLowStock,
                                    outOfStock: stockLabelOutOfStock,
                                    leftSuffix: stockLabelLeft,
                                });
                                const initial = (p.name || '?').trim().charAt(0).toUpperCase() || '?';

                                return (
                                <Animated.View
                                    key={p.id}
                                    style={[
                                        {
                                            ...localStyles.cardShell,
                                            borderRadius: tokens.radii.md,
                                            marginRight: tokens.spacing.sm,
                                            marginBottom: tokens.spacing.sm,
                                            width: '31.4%',
                                            position: 'relative',
                                            borderWidth: 1,
                                            borderColor: `${tokens.colors.border}EE`,
                                            transform: [{ scale: getScaleValue(p.id) }],
                                        },
                                        info.item.indexOf(p) === info.item.length - 1
                                            ? localStyles.lastCardInRow
                                            : null,
                                        getCardStateStyle(p),
                                        isActive ? localStyles.cardActiveShell : null,
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
                                    <Pressable
                                        onPressIn={() => markProductActive(p.id)}
                                        onPressOut={() => releaseProductActive(p.id)}
                                        onPress={() => handleProductSelected(p)}
                                        onLongPress={onLongPress ? () => onLongPress(p) : undefined}
                                        testID={
                                            stableSelector
                                                ? `sales-product-card-${stableSelector}`
                                                : undefined
                                        }
                                        style={({ pressed }) => [
                                            localStyles.cardPressable,
                                            pressed || isActive ? localStyles.cardPressed : null,
                                        ]}
                                    >
                                        {isActive ? <View pointerEvents="none" style={localStyles.cardActiveGlow} /> : null}
                                        <View style={localStyles.cardTopRow}>
                                            <View style={getCardBadgeStyle(p)}>
                                                <Text
                                                    testID={
                                                        stableSelector
                                                            ? `sales-product-stock-value-${stableSelector}`
                                                            : p.id
                                                                ? `sales-product-stock-${p.id}`
                                                                : undefined
                                                    }
                                                    style={getCardBadgeTextStyle(p)}
                                                    numberOfLines={1}
                                                >
                                                    {stockLabel}
                                                </Text>
                                            </View>
                                            {p.isEBTEligible ? (
                                                <View style={localStyles.ebtChip}>
                                                    <Text style={localStyles.ebtChipText}>EBT</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                        <View style={localStyles.mediaFrame}>
                                            <View style={localStyles.mediaGlow} />
                                            {p.picture ? (
                                                <UIS3Image
                                                    s3Key={p.picture}
                                                    width={62}
                                                    height={62}
                                                />
                                            ) : (
                                                <View style={localStyles.placeholderBadge}>
                                                    <Text style={localStyles.placeholderBadgeText}>
                                                        {initial}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={localStyles.productMeta}>
                                            <Text
                                                style={[
                                                    localStyles.nameText,
                                                    outOfStock ? localStyles.outOfStockText : null,
                                                ]}
                                                numberOfLines={2}
                                            >
                                                {p.name}
                                            </Text>
                                            <Text
                                                style={[
                                                    localStyles.metaText,
                                                    outOfStock ? localStyles.outOfStockText : null,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {p.picture ? productMetaWithPhoto : productMetaCatalogItem}
                                            </Text>
                                        </View>
                                        <View style={localStyles.priceWrap}>
                                            <Text style={localStyles.priceCaption}>{priceCaption}</Text>
                                            <Text
                                                style={[
                                                    localStyles.priceText,
                                                    outOfStock ? localStyles.outOfStockText : null,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                $ {p.price.toFixed(2)}
                                            </Text>
                                        </View>
                                    </Pressable>
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
            justifyContent: 'flex-start',
            flexWrap: 'nowrap',
        },
        cardShell: {
            backgroundColor: '#14181f',
            overflow: 'hidden',
            shadowColor: '#000000',
            shadowOpacity: 0.22,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
        },
        cardShellWarning: {
            backgroundColor: '#1b1710',
            borderColor: 'rgba(255, 176, 32, 0.55)',
        },
        cardShellDanger: {
            backgroundColor: '#1b1114',
            borderColor: 'rgba(255, 90, 95, 0.5)',
        },
        cardActiveShell: {
            borderColor: `${tokens.colors.accent}EE`,
            shadowColor: tokens.colors.accent,
            shadowOpacity: 0.24,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
        },
        lastCardInRow: {
            marginRight: 0,
        },
        cardPressable: {
            minHeight: 192,
            paddingHorizontal: tokens.spacing.md,
            paddingTop: tokens.spacing.sm,
            paddingBottom: tokens.spacing.md,
        },
        cardPressed: {
            opacity: 0.98,
            transform: [{ translateY: -1 }],
        },
        cardActiveGlow: {
            ...StyleSheet.absoluteFillObject,
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}55`,
            backgroundColor: `${tokens.colors.accent}08`,
        },
        cardTopRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing.sm,
            minHeight: 24,
        },
        mediaFrame: {
            minHeight: 72,
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: `${tokens.colors.border}F0`,
            backgroundColor: '#10151c',
            marginBottom: tokens.spacing.sm,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        },
        mediaGlow: {
            position: 'absolute',
            width: 92,
            height: 92,
            borderRadius: 46,
            backgroundColor: `${tokens.colors.accent}14`,
        },
        placeholderBadge: {
            width: 58,
            height: 58,
            borderRadius: 29,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${tokens.colors.accent}22`,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}44`,
        },
        placeholderBadgeText: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
        },
        productMeta: {
            flexGrow: 1,
            justifyContent: 'flex-start',
            minHeight: 58,
        },
        nameText: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: '800',
            letterSpacing: 0.1,
            marginBottom: 4,
        },
        metaText: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        stockBadge: {
            borderRadius: tokens.radii.xl,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: 5,
            borderWidth: 1,
            maxWidth: '72%',
        },
        stockBadgeNeutral: {
            borderColor: `${tokens.colors.accent}44`,
            backgroundColor: `${tokens.colors.accent}14`,
        },
        stockBadgeWarning: {
            borderColor: `${tokens.colors.warning}66`,
            backgroundColor: `${tokens.colors.warning}14`,
        },
        stockBadgeDanger: {
            borderColor: `${tokens.colors.danger}66`,
            backgroundColor: `${tokens.colors.danger}18`,
        },
        stockBadgeText: {
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 0.3,
        },
        stockBadgeTextNeutral: {
            color: tokens.colors.accent,
        },
        stockBadgeTextWarning: {
            color: tokens.colors.warning,
        },
        stockBadgeTextDanger: {
            color: tokens.colors.danger,
        },
        ebtChip: {
            borderRadius: tokens.radii.xl,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: 5,
            borderWidth: 1,
            borderColor: '#7d5bff66',
            backgroundColor: '#7d5bff1c',
        },
        ebtChipText: {
            color: '#cbb7ff',
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.8,
        },
        priceWrap: {
            marginTop: tokens.spacing.sm,
            paddingTop: tokens.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: `${tokens.colors.border}CC`,
        },
        priceCaption: {
            color: tokens.colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 2,
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
            opacity: 0.54,
        },
        outOfStockText: {
            opacity: 0.72,
        },
        priceText: {
            fontWeight: '800',
            fontSize: 24,
            color: tokens.colors.textPrimary,
            letterSpacing: -0.4,
        },
    });

export default ProductSelection;
