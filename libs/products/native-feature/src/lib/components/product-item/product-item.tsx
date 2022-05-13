import React, { useState } from 'react';

import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, Chip, useTheme } from '@rneui/themed';
import {
    productsActions,
    ProductEntity,
    ProductService,
} from '@pos/products/data-access';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UIS3Image } from '@pos/shared/ui-native';
import {
    selectCategoriesEntities,
    selectCategory,
} from '@pos/categories/data-access';
import { selectBrand } from '@pos/brands/data-access';
import { selectUnitOfMeasure } from '@pos/unit-of-measures/data-access';
import { Icon } from '@rneui/base';

export interface ProductItemProps {
    item: ProductEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function ProductItem({ item, navigation }: ProductItemProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();

    const category = useSelector(selectCategory(item.productCategoryId));
    const brand = useSelector(selectBrand(item.productBrandId));
    const unitOfMeasure = useSelector(
        selectUnitOfMeasure(item.productUnitOfMeasureId)
    );

    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await ProductService.delete(item.id);
        setBusy(false);
        dispatch(productsActions.remove(item.id));
    };

    const editItem = () => {
        dispatch(productsActions.select(item));
        navigation.navigate('Product Form');
    };

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => deleteItem() }]
        );
    };

    return (
        <View style={styles.dataRow}>
            {busy && <ActivityIndicator size="small" />}
            {item.picture && (
                <UIS3Image s3Key={item.picture} width={50} height={50} />
            )}
            {!item.picture && <View style={{ width: 50, height: 50 }} />}
            <View style={styles.column}>
                <Chip
                    title={category?.name}
                    containerStyle={{ borderRadius: 0 }}
                    buttonStyle={{ borderRadius: 5, padding: 2 }}
                />
            </View>
            <View style={{ flex: 2 }}>
                <Text style={styles.name}>
                    {item.name} ({unitOfMeasure?.name})
                </Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>$ {item.price}</Text>
            </View>
            <View style={{ flex: 2, flexDirection: 'row' }}>
                <Icon name="barcode" type="material-community" color={theme.theme.colors.grey2} />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.barcode}>B/C: {item.barcode}</Text>
                    <Text style={styles.barcode}>SKU: {item.sku}</Text>
                </View>
            </View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Button
                    type="clear"
                    title="Edit"
                    icon={{
                        name: 'pencil-outline',
                        type: 'material-community',
                    }}
                    onPress={editItem}
                />
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    onPress={confirmDeletion}
                />
            </View>
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            dataRow: {
                ...sharedStyles.row,
                padding: 20,
                backgroundColor: `${theme.theme.colors.searchBg}44`,
                borderRadius: 10,
                marginBottom: 10,
            },
            column: {
                marginRight: 15,
            },
            name: {
                fontSize: 16,
                color: theme.theme.colors.grey0,
                marginBottom: 5,
            },
            description: {
                fontSize: 14,
                color: theme.theme.colors.grey3,
            },
            barcode: {
                fontSize: 12,
                color: theme.theme.colors.grey2,
            },
        }),
    };
};

export default ProductItem;
