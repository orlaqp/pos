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
import { useDispatch, useSelector } from 'react-redux';
import {
    categoriesActions,
    CategoryEntity,
    selectAllCategories,
    selectedCategory,
} from '@pos/categories/data-access';
import { UIButton, UIS3Image } from '@pos/shared/ui-native';
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
    const dispatch = useDispatch();
    const allCategories: CategoryEntity = { name: 'Show\nAll' };
    const selected = useSelector(selectedCategory);

    const onSelection = (item: CategoryEntity) => {
        onSelected(item);
        dispatch(categoriesActions.select(item));
    }

    return (
        <SafeAreaView style={[styles.pageBackground, styles.list]}>
            <UIButton item={allCategories} onSelected={onSelection} />
            <FlatList
                data={categories}
                renderItem={({ item }) => (
                    <View
                        style={{
                            borderLeftWidth: 8,
                            borderColor:
                                item === selected
                                    ? theme.theme.colors.primary
                                    : undefined,
                        }}
                    >
                        <UIButton item={item} onSelected={onSelection} />
                    </View>
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
