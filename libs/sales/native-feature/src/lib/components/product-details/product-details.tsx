import { selectBrand } from '@pos/brands/data-access';
import { CartItem } from '@pos/sales/data-access';
import { UIS3Image } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { selectUnitOfMeasure } from '@pos/unit-of-measures/data-access';
import { Button, useTheme } from '@rneui/themed';
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
    const brand = useSelector(selectBrand(item.product.productBrandId));
    const unitOfMeasure = useSelector(selectUnitOfMeasure(item.product.productUnitOfMeasureId));
    const [quantity, setQuantity] = useState<number>(item.quantity || 0);
    const [price, setPrice] = useState<number>(item.product.price);

    useEffect(() => {
        setPrice(quantity * item.product.price);
    }, [item, quantity]);

    return (
        <View style={styles.productDetailsContainer}>
            <View style={{ height: 100 }}>
                <UIS3Image
                    s3Key={item.product.picture}
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
                {item.product.name}
            </Text>
            <Text style={[styles.subLabel, { fontSize: 14 }]}>
                {item.product.description}
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
            <View style={{ marginTop: 35, flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={styles.price}>$ {price?.toFixed(2)}</Text>
                <Text style={styles.unitOfMeasure}>{` (${unitOfMeasure?.name})`}</Text>
            </View>
            <Button
                style={{ marginTop: 35 }}
                type="clear"
                title={item.id ? 'Update cart' : 'Add to cart'}
                onPress={() => upsertCart({ id: item.id, product: item.product, quantity })}
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
