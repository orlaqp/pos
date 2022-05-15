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
import { useSelector } from 'react-redux';
import {
    CategoryEntity,
    selectAllCategories,
} from '@pos/categories/data-access';
import { UIS3Image } from '@pos/shared/ui-native';
import { FlatList } from 'react-native-gesture-handler';

const categories: Category[] = [];

/* eslint-disable-next-line */
export interface CategorySelectionProps {
    onSelected: (c: CategoryEntity) => void;
}

export function CategorySelection({ onSelected }: CategorySelectionProps) {
    const theme = useTheme();
    const styles = useStyles();
    const categories = useSelector(selectAllCategories);

    return (
        <SafeAreaView style={[styles.pageBackground, styles.list]}>
            <FlatList
                data={categories}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.container}
                        key={item.id}
                        onPress={() => onSelected(item)}
                    >
                        <View style={styles.centered}>
                            <UIS3Image
                                s3Key={item.picture}
                                width={35}
                                height={35}
                                factor={1.5}
                            />
                            <Text
                                style={{
                                    color: theme.theme.colors.black,
                                    marginTop: 5,
                                    marginBottom: 25,
                                    fontSize: 12,
                                }}
                            >
                                {item.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            list: {
                ...sharedStyles.darkBackground,
            },
            container: {},
            categoryBtn: {
                width: 80,
                height: 80,
                borderRadius: 4,
            },
            picture: { marginBottom: 15, width: 50, height: 50 },
        }),
    };
};

export default CategorySelection;
