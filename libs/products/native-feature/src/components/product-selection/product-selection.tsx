import { Product } from '@pos/models';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme, Text } from '@rneui/themed';
import React from 'react';

import { View, StyleSheet, TouchableOpacity } from 'react-native';

const products: Product[] = [
    new Product({ name: 'Coca-Cola', price: 5 }),
    new Product({ name: 'Churrasco', price: 5 }),
    new Product({ name: 'Chorizo (Abuelita)', price: 5 }),
    new Product({ name: 'Queso Manchego', price: 5 }),
    new Product({ name: 'Papitas', price: 5 }),
    new Product({ name: 'Dulce de Guayaba', price: 5 }),
  ];

/* eslint-disable-next-line */
export interface ProductSelectionProps {}

export function ProductSelection(props: ProductSelectionProps) {
    const theme = useTheme();
    const styles = useStyles();

  return (
    <View style={[{ padding: 10 }, styles.row]}>
      {products.map((c) => (
        <TouchableOpacity>
          <View style={[styles.centered, { width: 120 }]}>
            <View style={[styles.productBtn, { backgroundColor: theme.theme.colors.searchBg }]} />
            <Text style={{
                color: theme.theme.colors.black,
                marginBottom: 25,
            }}>{c.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}


const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();
  
    return {
      ...sharedStyles,
      ...StyleSheet.create({
          productBtn: {
              width: 80,
              height: 80,
              margin: 5,
              borderRadius: 4,
          }
      }),
    };
  };
  

export default ProductSelection;
