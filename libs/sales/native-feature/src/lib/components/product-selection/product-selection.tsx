import { ProductEntity } from '@pos/products/data-access';
import { MINIMUM_INVENTORY_FOR_SALE } from '@pos/sales/data-access';
import {
    ButtonItemType,
    UIButton,
    UIEbtRibbon,
    UIEmptyState,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { EACH } from '@pos/unit-of-measures/data-access';
import React, { useEffect, useState } from 'react';

import { View, Text, FlatList, StyleSheet } from 'react-native';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    products: ProductEntity[];
    onSelected: (p: ButtonItemType) => void;
}

export function ProductSelection({
    products,
    onSelected,
}: ProductSelectionProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const localStyles = useStyles(tokens);
    const [rows, setRows] = useState<ProductEntity[][]>();
    const [rowsToShow, setRowsToShow] = useState<number>(6);

    const productBackgroundColor = (product: ProductEntity) => {
        if (product.quantity < MINIMUM_INVENTORY_FOR_SALE)
            return styles.dangerBackground;
        if (product.reorderPoint && product.quantity > 0 && product.quantity <= product.reorderPoint)
            return styles.warningBackground;

        return styles.itemBackground;
    }

    useEffect(() => {
        const chunkSize = 3;
        const rows = [];

        for (let i = 0; i < products.length; i += chunkSize) {
            const chunk = products.slice(i, i + chunkSize);
            rows.push(chunk);
            // do whatever
        }

        setRows(rows);
    }, [products]);

    return (
        <View style={localStyles.container}>
            {!products.length && (
                <View style={localStyles.emptyWrap}>
                    <UIEmptyState
                        text="Select a category from the left or search for a product on top"
                        backgroundColor="transparent"
                    />
                </View>
            )}

            <View style={localStyles.listWrap}>
                <FlatList
                    data={rows?.slice(0, rowsToShow)}
                    // onEndReachedThreshold={0.2}
                    onEndReached={() => setRowsToShow(rowsToShow + 6)}
                    contentContainerStyle={localStyles.listContent}
                    renderItem={(info) => (
                        <View
                            style={[
                                styles.row, localStyles.row,
                            ]}
                        >
                            {info.item?.map((p) => (
                                <View
                                    key={p.id}
                                    style={{
                                        ...productBackgroundColor(p),
                                        borderRadius: tokens.radii.md,
                                        marginRight: tokens.spacing.sm,
                                        marginBottom: tokens.spacing.sm,
                                        width: 210,
                                        position: 'relative',
                                        borderWidth: 1,
                                        borderColor: tokens.colors.border,
                                    }}
                                >
                                    {p.isEBTEligible && <UIEbtRibbon />}
                                    <UIButton
                                        item={p}
                                        onSelected={onSelected}
                                        maxTextLength={14}
                                    >
                                        <View
                                            style={localStyles.productMeta}
                                        >
                                            <Text
                                                style={[
                                                    styles.labelText,
                                                    localStyles.stockText,
                                                ]}
                                            >
                                                In stock: {p.unitOfMeasure === EACH ? p.quantity : p.quantity.toFixed(2)}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.labelText,
                                                    localStyles.priceText,
                                                ]}
                                            >
                                                $ {p.price.toFixed(2)}
                                            </Text>
                                        </View>
                                    </UIButton>
                                </View>
                            ))}
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
            alignContent: 'space-around',
            justifyContent: 'flex-start',
        },
        productMeta: {
            marginTop: 4,
            padding: 8,
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
