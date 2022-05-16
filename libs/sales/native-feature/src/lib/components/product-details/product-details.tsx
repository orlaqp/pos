import { selectBrand } from '@pos/brands/data-access';
import { ProductEntity } from '@pos/products/data-access';
import { UIS3Image } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import { useDispatch, useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface ProductDetailsProps {
    product: ProductEntity;
    onAddToCart: (product: ProductEntity, quantity: number) => void;
}

export function ProductDetails({ product, onAddToCart }: ProductDetailsProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();
    const brand = useSelector(selectBrand(product.productBrandId));
    const [quantity, setQuantity] = useState<number>(1);
    const [price, setPrice] = useState<number>(product.price);

    useEffect(() => {
        setPrice(quantity * product.price);
    }, [product, quantity]);

    return (
        <View style={styles.productDetailsContainer}>
            <View style={{ height: 100 }}>
                <UIS3Image
                    s3Key={product.picture}
                    width={100}
                    height={100}
                    factor={0.5}
                />
            </View>
            {/* <UILabel type='info' text={brand?.name} /> */}
            <Text style={[styles.subLabel, { fontSize: 14 }]}>
                {brand?.name}
            </Text>
            <Text style={[styles.labelText, { fontSize: 20 }]}>
                {product.name}
            </Text>
            <Text style={[styles.subLabel, { fontSize: 14 }]}>
                {product.name}
            </Text>
            <View></View>
            <View style={{ marginTop: 25 }}>
                <NumericInput
                    type="plus-minus"
                    value={quantity}
                    onChange={setQuantity}
                    borderColor="transparent"
                    textColor={theme.theme.colors.grey1}
                    iconSize={20}
                    totalHeight={50}
                    leftButtonBackgroundColor={theme.theme.colors.grey2}
                    rightButtonBackgroundColor={theme.theme.colors.success}
                    minValue={0}
                    rounded={true}
                />
            </View>
            <View style={{ marginTop: 35 }}>
                <Text style={styles.price}>$ {price.toFixed(2)}</Text>
            </View>
            <Button
                style={{ marginTop: 35 }}
                type="clear"
                title={'Add to cart'}
                onPress={() => onAddToCart(product, quantity)}
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
        }),
    };
};

export default ProductDetails;
