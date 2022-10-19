import { selectBrand } from '@pos/brands/data-access';
import { selectProduct } from '@pos/products/data-access';
import { CartItem } from '@pos/sales/data-access';
import { UIS3Image } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { EACH } from '@pos/unit-of-measures/data-access';
import { Button, Input, useTheme } from '@rneui/themed';
import React, { useEffect, useRef, useState } from 'react';

import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import { useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface ProductDetailsProps {
    item: CartItem;
    upsertCart: (item: CartItem) => void;
    enforceSalesBasedOnInventory?: boolean;
}

export function ProductDetails({ item, upsertCart, enforceSalesBasedOnInventory }: ProductDetailsProps) {
    const theme = useTheme();
    const styles = useStyles();
    const ref = React.createRef<TextInput>();
    const [quantity, setQuantity] = useState<string>(
        item.quantity === 0 ? '' : item.quantity.toString()
    );
    const [price, setPrice] = useState<number>(item.product.price);
    const product = useSelector(selectProduct(item.product.id));
    const brand = useSelector(selectBrand(product?.productBrandId));
    const each = item.product.unitOfMeasure === EACH;

    const validateInfo = () => {
        const q = quantity === '' ? 0 : +quantity;
        if (enforceSalesBasedOnInventory && product && product?.quantity - q < 0 ) {
            Alert.alert('Cannot sale this much', 'You are trying to sale a bigger quantity than what is available in inventory');
            return;
        }

        upsertCart({
            identifier: item.identifier,
            product: item.product,
            quantity: quantity === '' ? 0 : +quantity,
        });
    }

    useEffect(() => {
        setPrice(+quantity * item.product.price);
    }, [item, quantity]);

    useEffect(() => {
        ref.current?.focus();
    }, []);

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
                            ref={ref}
                            value={quantity.toString()}
                            placeholder="Weight ..."
                            keyboardType="decimal-pad"
                            style={{ fontSize: 32 }}
                            textAlign="center"
                            onChangeText={(text) => {
                                const val = +text;
                                
                                if (text.length > 0 && (isNaN(val) || !text.match(/^[0-9]+(\.[0-9]*)*$/)))
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
                title={item.identifier ? 'Update cart' : 'Add to cart'}
                onPress={validateInfo}
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
