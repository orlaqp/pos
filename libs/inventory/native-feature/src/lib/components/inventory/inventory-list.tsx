import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    ProductEntity,
    ProductService,
    selectAllProducts,
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { UICard, UIEmptyState, UIScreen, UISearchInput } from '@pos/shared/ui-native';
import InventoryLine from './inventory-line';
import { dedupeProducts } from '../shared/dedupe-products';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export function InventoryList({ navigation: _navigation }: InventoryListProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const products = useSelector(selectAllProducts);
    const [filterText, setFilterText] = useState<string>();
    const [filteredList, setFilteredList] = useState<ProductEntity[]>(products);

    useEffect(() => {
        const products = subscribeToProductChanges(dispatch);

        return () => {
            products.unsubscribe();
        };
    }, [dispatch]);

    useEffect(() => {
        const res = ProductService.search(products, {
            text: filterText,
        });
        setFilteredList(dedupeProducts(res.items));
    }, [filterText, products]);

    return (
        <UIScreen>
            <View style={styles.page}>
                <UICard tone="muted" style={styles.headerCard}>
                    <View style={[styles.header, { alignItems: 'center' }]}>
                        <View style={{ flex: 5 }}>
                            <UISearchInput
                                testID="inventory-stock-search-input"
                                debounceTime={300}
                                onSubmit={(text) => setFilterText(text)}
                            />
                        </View>
                    </View>
                </UICard>
                <View style={styles.content}>
                    {filteredList.length === 0 && (
                        <UIEmptyState text="No products found" />
                    )}
                    {filteredList.length > 0 && (
                        <>
                        <View style={[styles.smallDataRow, styles.tableHeader]}>
                            <View style={{flex: 4}}></View>
                            <View style={{flex: 1}}>
                                <Text style={[styles.primaryText, styles.textCenter]}>
                                    Reorder Point
                                </Text>
                            </View>
                            <View style={{flex: 1}}>
                                <Text style={[styles.primaryText, styles.textCenter]}>
                                    Reorder Qty
                                </Text>
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
            headerCard: {
                marginHorizontal: tokens.spacing.md,
                marginTop: tokens.spacing.md,
                marginBottom: tokens.spacing.sm,
            },
            header: {
                flexDirection: 'row',
                justifyContent: 'center',
            },
            content: {
                paddingHorizontal: tokens.spacing.lg,
                paddingTop: tokens.spacing.sm,
                paddingBottom: tokens.spacing.lg,
                flex: 1,
            },
            tableHeader: {
                marginBottom: tokens.spacing.sm,
            },
        }),
    };
};

export default InventoryList;
