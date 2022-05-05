import { Category } from '@pos/models';
import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import { Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories: Category[] = [
  new Category({ code: '1', color: '#2962FF', name: 'Beverages' }),
  new Category({ code: '2', color: '#AA00FF', name: 'Bread' }),
  new Category({ code: '3', color: '#D32F2F', name: 'Meat' }),
  new Category({ code: '4', color: '#F5F5F5', name: 'Dairy' }),
  new Category({ code: '5', color: '#4DD0E1', name: 'Canned' }),
  new Category({ code: '1', color: '#2962FF', name: 'Beverages' }),
  new Category({ code: '2', color: '#AA00FF', name: 'Bread' }),
  new Category({ code: '3', color: '#D32F2F', name: 'Meat' }),
  new Category({ code: '4', color: '#F5F5F5', name: 'Dairy' }),
  new Category({ code: '5', color: '#4DD0E1', name: 'Canned' }),
  new Category({ code: '2', color: '#AA00FF', name: 'Bread' }),
  new Category({ code: '3', color: '#D32F2F', name: 'Meat' }),
  new Category({ code: '4', color: '#F5F5F5', name: 'Dairy' }),
  new Category({ code: '5', color: '#4DD0E1', name: 'Canned' }),
  new Category({ code: '2', color: '#AA00FF', name: 'Bread' }),
  new Category({ code: '3', color: '#D32F2F', name: 'Meat' }),
  new Category({ code: '4', color: '#F5F5F5', name: 'Dairy' }),
  new Category({ code: '5', color: '#4DD0E1', name: 'Canned' }),
];

/* eslint-disable-next-line */
export interface CategorySelectionProps {}

export function CategorySelection(props: CategorySelectionProps) {
  const theme = useTheme();
  const styles = useStyles();
  const [uri, setUri] = useState(undefined);
  const imageKey = 'category-5E7F1392-DE4A-427D-A3B3-C36F8BFF4CA6.png';

  useEffect(() => {
    const fetchImageUri = async () => {
      const image = await Storage.get(imageKey);
      setUri(image as any);
    };

    fetchImageUri();
  }, []);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView horizontal={true}>
        <TouchableOpacity style={styles.container}>
          <View style={styles.centered}>
            {/* <View style={[styles.categoryBtn, { backgroundColor: c.color }]} /> */}
            <Image source={{ uri }} style={styles.picture} />
            <Text style={{ color: theme.theme.colors.black, marginBottom: 25 }}>
              Meat
            </Text>
          </View>
        </TouchableOpacity>

        {categories.map((c) => (
          <TouchableOpacity style={styles.container}>
            <View style={styles.centered}>
              <View
                style={[styles.categoryBtn, { backgroundColor: c.color }]}
              />
              <Text
                style={{ color: theme.theme.colors.black, marginBottom: 25 }}
              >
                {c.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = () => {
  const theme = useTheme();
  const sharedStyles = useSharedStyles();

  return {
    ...sharedStyles,
    ...StyleSheet.create({
      container: {
        marginRight: 20,
      },
      categoryBtn: {
        width: 80,
        height: 80,
        borderRadius: 4,
      },
      picture: { marginBottom: 15, width: 75, height: 75 },
    }),
  };
};

export default CategorySelection;
