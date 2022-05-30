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
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { UIEmptyState, UISearchInput } from '@pos/shared/ui-native';
import InventoryLine from './inventory-line';

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function InventoryList({ navigation }: InventoryListProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const products = useSelector(selectAllProducts);
    const [filterText, setFilterText] = useState<string>();
    const [filteredList, setFilteredList] = useState<ProductEntity[]>(products);

    useEffect(() => {
        const products = subscribeToProductChanges(dispatch);

        return () => {
            console.log('Closing products subscription');
            products.unsubscribe();
        };
    }, [dispatch]);

    useEffect(() => {
        const res = ProductService.search(products, {
            text: filterText,
        });
        setFilteredList(res.items);
    }, [filterText, products]);

    return (
        <SafeAreaView style={styles.page}>
            <View style={{ flexDirection: 'column' }}>
                <View style={[styles.header, { alignItems: 'center' }]}>
                    <View style={{ flex: 5 }}>
                        <UISearchInput
                            debounceTime={300}
                            onSubmit={(text) => setFilterText(text)}
                        />
                    </View>
                </View>
                <View style={{ padding: 20 }}>
                    {filteredList.length === 0 && (
                        <UIEmptyState text="No orders found" />
                    )}
                    {filteredList.length > 0 && (
                        <FlatList
                            data={filteredList}
                            renderItem={({ item }) => (
                                <InventoryLine item={item} />
                            )}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const useStyles = () => {
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            header: {
                margin: 10,
                flexDirection: 'row',
                justifyContent: 'center',
            },
        }),
    };
};

export default InventoryList;
