import { selectBrand } from '@pos/brands/data-access';
import { selectProduct } from '@pos/products/data-access';
import { CartItem } from '@pos/sales/data-access';
import { UIS3Image } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { EACH } from '@pos/unit-of-measures/data-access';
import { Button, Input, useTheme } from '@rneui/themed';
import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import { useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface ProductDetailsProps {
    item: CartItem;
    upsertCart: (item: CartItem) => void;
}

export function ProductDetails({ item, upsertCart }: ProductDetailsProps) {
    const theme = useTheme();
    const styles = useStyles();
    const [quantity, setQuantity] = useState<string>(
        item.quantity.toString() || '0'
    );
    const [price, setPrice] = useState<number>(item.product.price);
    const product = useSelector(selectProduct(item.product.id));
    const brand = useSelector(selectBrand(product?.productBrandId));
    const each = item.product.unitOfMeasure === EACH;

    useEffect(() => {
        setPrice(+quantity * item.product.price);
    }, [item, quantity]);

    return (
        <View style={styles.productDetailsContainer}>
            <View style={{ height: 100 }}>
                <UIS3Image
                    s3Key={product?.picture}
                    width={100}
                    height={100}
                    factor={0.5}
                />
            </View>
            <Text style={[styles.subLabel, { fontSize: 14 }]}>
                {brand?.name}
            </Text>
            <Text style={[styles.labelText, { fontSize: 20 }]}>
                {item.product.name}
            </Text>
            <Text style={[styles.subLabel, { fontSize: 14 }]}>
                {product?.description}
            </Text>
            <View></View>
            <View style={{ marginTop: 25 }}>
                {each && (
                    <NumericInput
                        type="plus-minus"
                        valueType="integer"
                        value={+quantity}
                        onChange={(val) => setQuantity(val.toString())}
                        borderColor="transparent"
                        textColor={theme.theme.colors.grey1}
                        iconSize={20}
                        totalHeight={50}
                        leftButtonBackgroundColor={theme.theme.colors.grey4}
                        rightButtonBackgroundColor={theme.theme.colors.success}
                        minValue={1}
                        step={1}
                        rounded={true}
                    />
                )}
                {!each && (
                    <View style={{ width: 150, flexDirection: 'row', justifyContent: 'center' }}>
                        <Input
                            value={quantity === '0' ? '' : quantity.toString()}
                            placeholder="Weight ..."
                            keyboardType="decimal-pad"
                            style={{ fontSize: 32 }}
                            textAlign="center"
                            onChangeText={(text) => {
                                const val = +text;

                                if (isNaN(val) && !text.match(/^[0-9]+\.$/))
                                    return;

                                setQuantity(text);
                            }}
                        />
                        <Text
                            style={styles.unitOfMeasure}
                        >{` (${item.product.unitOfMeasure})`}</Text>
                    </View>
                )}
            </View>
            <View
                style={{
                    marginTop: 35,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                }}
            >
                <Text style={styles.price}>$ {price?.toFixed(2)}</Text>
            </View>
            <Button
                style={{ marginTop: 35 }}
                type="clear"
                title={item.id ? 'Update cart' : 'Add to cart'}
                onPress={() =>
                    upsertCart({
                        id: item.id,
                        product: item.product,
                        quantity: quantity === '' ? 0 : +quantity,
                    })
                }
            />
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            productDetailsContainer: {
                flexDirection: 'column',
                alignItems: 'center',
            },
            pictureColumn: {
                flex: 1,
                marginRight: 35,
            },
            quantity: {
                fontSize: 14,
            },
            price: {
                fontSize: 48,
                fontWeight: 'bold',
                color: theme.theme.colors.grey0,
            },
            unitOfMeasure: {
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.theme.colors.grey3,
                lineHeight: 48,
            },
        }),
    };
};

export default ProductDetails;
