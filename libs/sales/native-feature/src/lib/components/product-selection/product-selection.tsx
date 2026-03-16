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
import React, { useEffect, useState } from 'react';

import { View, Text, FlatList, StyleSheet } from 'react-native';
import {
    chunkProducts,
    getNextRowsToShow,
    getProductCardState,
} from './product-selection.logic';

/* eslint-disable-next-line */
export interface ProductSelectionProps {
    products: ProductEntity[];
    onSelected: (p: ButtonItemType) => void;
    onLongPress?: (p: ButtonItemType) => void;
}

export function ProductSelection({
    products,
    onSelected,
    onLongPress,
}: ProductSelectionProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const localStyles = useStyles(tokens);
    const [rows, setRows] = useState<ProductEntity[][]>();
    const [rowsToShow, setRowsToShow] = useState<number>(6);

    const productBackgroundColor = (product: ProductEntity) => {
        const state = getProductCardState(product);
        if (state === 'danger')
            return styles.dangerBackground;
        if (state === 'warning')
            return styles.warningBackground;

        return styles.itemBackground;
    }

    useEffect(() => {
        setRows(chunkProducts(products));
    }, [products]);

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
                    data={rows?.slice(0, rowsToShow)}
                    // onEndReachedThreshold={0.2}
                    onEndReached={() => setRowsToShow(getNextRowsToShow(rowsToShow))}
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
                                        marginRight: 0,
                                        marginBottom: tokens.spacing.sm,
                                        width: '32%',
                                        position: 'relative',
                                        borderWidth: 1,
                                        borderColor: tokens.colors.border,
                                    }}
                                >
                                    {p.isEBTEligible && <UIEbtRibbon />}
                                    <UIButton
                                        item={p}
                                        onSelected={onSelected}
                                        onLongPress={onLongPress}
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
            alignContent: 'stretch',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
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
