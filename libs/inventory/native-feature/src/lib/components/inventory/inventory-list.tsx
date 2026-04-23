import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    ProductService,
    selectAllProducts,
} from '@pos/products/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { UIEmptyState, UIScreen, UISearchInput } from '@pos/shared/ui-native';
import InventoryLine from './inventory-line';
import { dedupeProducts } from '../shared/dedupe-products';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export function InventoryList({ navigation: _navigation }: InventoryListProps) {
    const styles = useStyles();
    const products = useSelector(selectAllProducts);
    const [filterText, setFilterText] = useState<string>();
    const filteredList = useMemo(() => {
        const res = ProductService.search(products, {
            text: filterText,
        });
        return dedupeProducts(res.items);
    }, [filterText, products]);

    return (
        <UIScreen>
            <View style={styles.page}>
                <View style={styles.headerPanel}>
                    <View style={styles.headerCopy}>
                        <Text style={styles.eyebrow}>Inventory</Text>
                        <Text style={styles.headerTitle}>Stock levels</Text>
                    </View>
                    <View style={styles.searchWrap}>
                            <UISearchInput
                                testID="inventory-stock-search-input"
                                debounceTime={300}
                                onSubmit={(text) => setFilterText(text)}
                            />
                    </View>
                </View>
                <View style={styles.content}>
                    {filteredList.length === 0 && (
                        <UIEmptyState text="No products found" />
                    )}
                    {filteredList.length > 0 && (
                        <>
                        <View style={styles.tableHeader}>
                            <View style={styles.tableProductColumn}>
                                <Text style={styles.tableHeaderText}>Product</Text>
                            </View>
                            <View style={styles.tableQtyColumn}>
                                <Text style={styles.tableHeaderText}>On hand</Text>
                            </View>
                            <View style={styles.tableQtyColumn}>
                                <Text style={styles.tableHeaderText}>Reorder point</Text>
                            </View>
                            <View style={styles.tableQtyColumn}>
                                <Text style={styles.tableHeaderText}>Reorder qty</Text>
                            </View>
                        </View>
                        <FlatList
                            data={filteredList}
                            renderItem={({ item }) => (
                                <InventoryLine item={item} />
                            )}
                        />
                        </>
                    )}
                </View>
            </View>
        </UIScreen>
    );
}

const useStyles = () => {
    const sharedStyles = useSharedStyles();
    const tokens = useDesignTokens();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            headerPanel: {
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: tokens.spacing.md,
                marginHorizontal: tokens.spacing.md,
                marginTop: tokens.spacing.md,
                marginBottom: tokens.spacing.sm,
            },
            headerCopy: {
                minWidth: 220,
            },
            eyebrow: {
                color: tokens.colors.accent,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 1.6,
                marginBottom: 4,
                textTransform: 'uppercase',
            },
            headerTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 28,
                fontWeight: '800',
            },
            searchWrap: {
                flex: 1,
            },
            content: {
                paddingHorizontal: tokens.spacing.lg,
                paddingTop: tokens.spacing.sm,
                paddingBottom: tokens.spacing.lg,
                flex: 1,
            },
            tableHeader: {
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: '#223044',
                borderRadius: 18,
                borderWidth: 1,
                backgroundColor: '#0A1018',
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.sm,
                marginBottom: tokens.spacing.sm,
            },
            tableHeaderText: {
                color: tokens.colors.textSecondary,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 1.1,
                textTransform: 'uppercase',
            },
            tableProductColumn: {
                flex: 4,
            },
            tableQtyColumn: {
                flex: 1,
                alignItems: 'center',
            },
        }),
    };
};

export default InventoryList;
