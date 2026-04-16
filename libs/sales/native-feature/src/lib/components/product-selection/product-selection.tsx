import { ProductEntity } from '@pos/products/data-access';
import {
    ButtonItemType,
    UIButton,
    UIEbtRibbon,
    UIEmptyState,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { EACH } from '@pos/unit-of-measures/data-access';
import React, { useMemo } from 'react';

import { View, Text, FlatList, StyleSheet } from 'react-native';
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
    const styles = useSharedStyles();
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
                        <View
                            style={[
                                styles.row, localStyles.row,
                            ]}
                        >
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
                                          : styles.itemBackground;

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
                                        {p.isEBTEligible && <UIEbtRibbon />}
                                        <UIButton
                                            item={p}
                                            onSelected={onSelected}
                                            onLongPress={onLongPress}
                                            maxTextLength={14}
                                        >
                                            <View style={localStyles.productMeta}>
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
                                                <Text
                                                    testID={
                                                        p.id
                                                            ? `sales-product-stock-${p.id}`
                                                            : undefined
                                                    }
                                                    style={[
                                                        styles.labelText,
                                                        localStyles.stockText,
                                                        visualState.isBlocked
                                                            ? localStyles.blockedText
                                                            : null,
                                                    ]}
                                                >
                                                    In stock:{' '}
                                                    {p.unitOfMeasure === EACH
                                                        ? p.quantity
                                                        : p.quantity.toFixed(2)}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.labelText,
                                                        localStyles.priceText,
                                                        visualState.isBlocked
                                                            ? localStyles.blockedText
                                                            : null,
                                                    ]}
                                                >
                                                    $ {p.price.toFixed(2)}
                                                </Text>
                                            </View>
                                        </UIButton>
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
            alignContent: 'stretch',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
        },
        card: {
            borderRadius: tokens.radii.md,
            marginRight: 0,
            marginBottom: tokens.spacing.sm,
            width: '32%',
            position: 'relative',
            borderWidth: 1,
            borderColor: tokens.colors.border,
        },
        lowInventoryCard: {
            backgroundColor: `${tokens.colors.warning}22`,
            borderColor: `${tokens.colors.warning}66`,
        },
        outOfStockCard: {
            backgroundColor: `${tokens.colors.danger}20`,
            borderColor: `${tokens.colors.danger}66`,
        },
        blockedCard: {
            opacity: 0.58,
        },
        productMeta: {
            marginTop: 4,
            padding: 8,
            alignItems: 'center',
        },
        statusChip: {
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs,
            borderRadius: tokens.radii.lg,
            marginBottom: tokens.spacing.xs,
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
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
        },
        stockText: {
            fontWeight: '700',
            fontSize: 14,
        },
        priceText: {
            fontWeight: '800',
            fontSize: 20,
        },
        blockedText: {
            color: tokens.colors.textSecondary,
        },
    });

export default ProductSelection;
