import React, { useEffect, useState } from 'react';

import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';
import { Storage } from 'aws-amplify';
import { Category } from '@pos/shared/models';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories: Category[] = [];

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
                style={[styles.categoryBtn]}
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
