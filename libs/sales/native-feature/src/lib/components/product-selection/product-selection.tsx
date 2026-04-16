import { ProductEntity } from '@pos/products/data-access';
import {
    ButtonItemType,
    UIEbtRibbon,
    UIEmptyState,
    UIS3Image,
} from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { EACH } from '@pos/unit-of-measures/data-access';
import React, { useMemo } from 'react';

import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import {
    chunkProducts,
    getProductInventoryVisualState,
} from './product-selection.logic';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    products: ProductEntity[];
    enforceSalesBasedOnInventory?: boolean;
    onSelected: (p: ButtonItemType) => void;
    onLongPress?: (p: ButtonItemType) => void;
}

export function ProductSelection({
    products,
    enforceSalesBasedOnInventory,
    onSelected,
    onLongPress,
}: ProductSelectionProps) {
    const tokens = useDesignTokens();
    const localStyles = useStyles(tokens);
    const rows = useMemo(() => chunkProducts(products), [products]);

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
                        <View style={localStyles.row}>
                            {info.item?.map((p) => {
                                const visualState = getProductInventoryVisualState(
                                    p,
                                    enforceSalesBasedOnInventory
                                );
                                const cardBackgroundStyle =
                                    visualState.state === 'danger'
                                        ? localStyles.outOfStockCard
                                        : visualState.state === 'warning'
                                          ? localStyles.lowInventoryCard
                                          : localStyles.defaultCard;

                                return (
                                    <View
                                        key={p.id}
                                        testID={p.id ? `sales-product-card-${p.id}` : undefined}
                                        accessibilityState={{
                                            disabled: visualState.isBlocked,
                                        }}
                                        style={[
                                            localStyles.card,
                                            cardBackgroundStyle,
                                            visualState.isBlocked
                                                ? localStyles.blockedCard
                                                : null,
                                        ]}
                                    >
                                        {p.isEBTEligible ? (
                                            <UIEbtRibbon top={0} right={0} />
                                        ) : null}
                                        <Pressable
                                            testID={p.id ? `ui-button-${p.id}` : undefined}
                                            onPress={() => onSelected(p)}
                                            onLongPress={
                                                onLongPress
                                                    ? () => onLongPress(p)
                                                    : undefined
                                            }
                                            style={({ pressed }) => [
                                                localStyles.cardPressable,
                                                pressed ? localStyles.cardPressed : null,
                                            ]}
                                        >
                                            <View style={localStyles.imagePanel}>
                                                <View style={localStyles.cardHeader}>
                                                {visualState.statusLabel ? (
                                                    <View
                                                        style={[
                                                                localStyles.statusChip,
                                                                visualState.state === 'danger'
                                                                    ? localStyles.statusChipDanger
                                                                    : localStyles.statusChipWarning,
                                                            ]}
                                                        >
                                                            <Text
                                                                testID={
                                                                    p.id
                                                                        ? `sales-product-status-${p.id}`
                                                                        : undefined
                                                                }
                                                                style={localStyles.statusChipText}
                                                            >
                                                                {visualState.statusLabel}
                                                            </Text>
                                                        </View>
                                                    ) : null}
                                                </View>
                                                <View style={localStyles.imageFrame}>
                                                    {p.picture ? (
                                                        <UIS3Image
                                                            s3Key={p.picture}
                                                            width={72}
                                                            height={72}
                                                            factor={1.5}
                                                        />
                                                    ) : (
                                                        <Text style={localStyles.imageFallback}>
                                                            {p.name
                                                                .trim()
                                                                .charAt(0)
                                                                .toUpperCase() || 'P'}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            <View style={localStyles.productMeta}>
                                                <Text
                                                    style={[
                                                        localStyles.nameText,
                                                        visualState.isBlocked
                                                            ? localStyles.blockedText
                                                            : null,
                                                    ]}
                                                    numberOfLines={2}
                                                >
                                                    {p.name}
                                                </Text>
                                                <View style={localStyles.metaFooter}>
                                                    <View style={localStyles.metaCopy}>
                                                        <Text
                                                            style={[
                                                                localStyles.stockLabel,
                                                                visualState.isBlocked
                                                                    ? localStyles.blockedText
                                                                    : null,
                                                            ]}
                                                        >
                                                            In stock
                                                        </Text>
                                                        <Text
                                                            testID={
                                                                p.id
                                                                    ? `sales-product-stock-${p.id}`
                                                                    : undefined
                                                            }
                                                            style={[
                                                                localStyles.stockText,
                                                                visualState.isBlocked
                                                                    ? localStyles.blockedText
                                                                    : null,
                                                            ]}
                                                        >
                                                            {p.unitOfMeasure === EACH
                                                                ? p.quantity
                                                                : p.quantity.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={[
                                                            localStyles.priceText,
                                                            visualState.isBlocked
                                                                ? localStyles.blockedText
                                                                : null,
                                                        ]}
                                                    >
                                                        ${p.price.toFixed(2)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Pressable>
                                    </View>
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
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
        },
        card: {
            borderRadius: tokens.radii.lg,
            marginRight: 0,
            marginBottom: tokens.spacing.sm,
            width: '32%',
            position: 'relative',
            borderWidth: 1,
            borderColor: tokens.colors.border,
            overflow: 'hidden',
            shadowColor: '#000000',
            shadowOpacity: 0.18,
            shadowRadius: 12,
            shadowOffset: {
                width: 0,
                height: 6,
            },
            elevation: 3,
        },
        lowInventoryCard: {
            backgroundColor: `${tokens.colors.warning}16`,
            borderColor: `${tokens.colors.warning}66`,
        },
        outOfStockCard: {
            backgroundColor: `${tokens.colors.danger}14`,
            borderColor: `${tokens.colors.danger}66`,
        },
        defaultCard: {
            backgroundColor: `${tokens.colors.surface}b3`,
        },
        blockedCard: {
            opacity: 1,
        },
        cardPressable: {
            flex: 1,
            minHeight: 214,
        },
        cardPressed: {
            opacity: 0.9,
        },
        imagePanel: {
            backgroundColor: `${tokens.colors.surface}dd`,
            paddingTop: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.md,
            paddingBottom: tokens.spacing.sm,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 28,
            marginBottom: tokens.spacing.sm,
        },
        imageFrame: {
            height: 92,
            borderRadius: tokens.radii.md,
            backgroundColor: `${tokens.colors.canvas}22`,
            borderWidth: 1,
            borderColor: `${tokens.colors.border}99`,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        imageFallback: {
            color: tokens.colors.textMuted,
            fontSize: 30,
            fontWeight: '700',
        },
        productMeta: {
            flex: 1,
            paddingHorizontal: tokens.spacing.md,
            paddingTop: tokens.spacing.sm,
            paddingBottom: tokens.spacing.md,
            justifyContent: 'space-between',
        },
        nameText: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '700',
            lineHeight: 20,
            minHeight: 40,
            textAlign: 'left',
            marginBottom: tokens.spacing.sm,
        },
        metaFooter: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: tokens.spacing.xs,
        },
        metaCopy: {
            flex: 1,
        },
        stockLabel: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        statusChip: {
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs,
            borderRadius: tokens.radii.lg,
            alignSelf: 'flex-start',
        },
        statusChipWarning: {
            backgroundColor: `${tokens.colors.warning}2a`,
            borderWidth: 1,
            borderColor: `${tokens.colors.warning}66`,
        },
        statusChipDanger: {
            backgroundColor: `${tokens.colors.danger}2a`,
            borderWidth: 1,
            borderColor: `${tokens.colors.danger}66`,
        },
        statusChipText: {
            color: tokens.colors.textPrimary,
            fontSize: 10,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
        },
        stockText: {
            fontWeight: '700',
            fontSize: 14,
            color: tokens.colors.textSecondary,
        },
        priceText: {
            fontWeight: '800',
            fontSize: 24,
            color: tokens.colors.textPrimary,
        },
        blockedText: {
            color: tokens.colors.textSecondary,
        },
    });

export default ProductSelection;
