import React, { useState } from 'react';

import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import {
    productsActions,
    ProductEntity,
    ProductService,
} from '@pos/products/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UIEbtRibbon, UIS3Image } from '@pos/shared/ui-native';
import { Icon } from '@rneui/base';

export interface ProductItemProps {
    item: ProductEntity;
    navigation: NativeStackNavigationProp<any>;
}

export interface ProductCodeLine {
    label: 'UPC' | 'SKU' | 'PLU';
    value: string;
}

export const getProductCodeLines = (item: ProductEntity): ProductCodeLine[] => {
    const lines: ProductCodeLine[] = [];
    if (item.barcode) lines.push({ label: 'UPC', value: item.barcode });
    if (item.sku) lines.push({ label: 'SKU', value: item.sku });
    if (item.plu) lines.push({ label: 'PLU', value: item.plu });
    return lines;
};

export const hasProductCodes = (item: ProductEntity) =>
    getProductCodeLines(item).length > 0;

export const formatProductTitle = (item: ProductEntity) =>
    `${item.name} (${item.unitOfMeasure})`;

export const deleteProductById = async (
    id: string | undefined,
    deleteProduct: (id: string) => Promise<any>,
    removeProduct: (id: string) => any
) => {
    if (!id) return false;
    await deleteProduct(id);
    removeProduct(id);
    return true;
};

export function ProductItem({ item, navigation }: ProductItemProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);
    const codeLines = getProductCodeLines(item);

    const deleteItem = async () => {
        setBusy(true);
        await deleteProductById(
            item.id,
            (id) => ProductService.delete(id),
            (id) => dispatch(productsActions.remove(id))
        );
        setBusy(false);
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
        <TouchableOpacity
            style={[
                styles.dataRow,
                {
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                },
            ]}
            onPress={editItem}
        >
            {busy && <ActivityIndicator size="small" />}
            <View style={styles.thumbnailSlot}>
                {item.picture && (
                    <UIS3Image s3Key={item.picture} width={50} height={50} />
                )}
            </View>
            <View style={{ flex: 2.6, paddingRight: 8 }}>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                    {formatProductTitle(item)}
                </Text>
                <Text
                    style={[styles.description, styles.secondaryReadable]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.description}
                </Text>
            </View>
            <View style={[styles.column, { flex: 0.8 }]}>
                <Text style={[styles.name, { textAlign: 'right' }]}>
                    $ {item.price.toFixed(2)}
                </Text>
            </View>
            <View style={{ flex: 2.2, flexDirection: 'row', justifyContent: 'center' }}>
                {hasProductCodes(item) &&
                <View>
                    <Icon
                        name="barcode"
                        type="material-community"
                        color={theme.theme.colors.grey2}
                    />
                </View>
                }
                <View style={{ marginLeft: 10, alignSelf: 'center' }}>
                    {codeLines.map((line) => (
                        <Text
                            key={line.label}
                            style={[styles.barcode, styles.secondaryReadable]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {line.label}: {line.value}
                        </Text>
                    ))}
                </View>
            </View>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                {/* <Button
                    type="clear"
                    title="Edit"
                    icon={{
                        name: 'pencil-outline',
                        type: 'material-community',
                    }}
                    onPress={editItem}
                /> */}
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.grey2,
                    }}
                    buttonStyle={styles.deleteButton}
                    onPress={confirmDeletion}
                />
            </View>
            {item.isEBTEligible && <UIEbtRibbon />}
        </TouchableOpacity>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            column: {
                marginRight: 15,
            },
            thumbnailSlot: {
                width: 70,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
            },
            barcode: {
                fontSize: 12,
                color: theme.theme.colors.grey2,
            },
            secondaryReadable: {
                color: theme.theme.colors.grey1,
            },
            deleteButton: {
                opacity: 0.75,
            },
        }),
    };
};

export default ProductItem;
