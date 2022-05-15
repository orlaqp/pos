import { ProductEntity } from '@pos/products/data-access';
import { UIS3Image } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, StyleSheet } from 'react-native';

/* eslint-disable-next-line */
export interface ProductDetailsProps {
    product: ProductEntity;
}

export function ProductDetails({ product }: ProductDetailsProps) {
    const styles = useStyles();

    return (
        <View style={styles.productDetailsContainer}>
            <View style={styles.pictureColumn}>
                <UIS3Image
                    s3Key={product.picture}
                    width={100}
                    height={100}
                    factor={.5}
                />
            </View>
            <View style={styles.prodDetails}>
                <Text style={styles.labelText}>{product.name}</Text>
                <Text style={styles.subLabel}>{product.name}</Text>
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
            productDetailsContainer: {
                flexDirection: 'row',
            },
            pictureColumn: {
                flex: 1,
            },
            prodDetails: {
                flex: 5,
            },
            quantity: {
                fontSize: 14
            },
            price: {
                fontSize: 18
            }
        }),
    };
};

export default ProductDetails;
