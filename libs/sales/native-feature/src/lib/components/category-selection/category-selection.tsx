import React, { useCallback } from 'react';
import { categoriesActions, CategoryEntity, selectAllCategories, selectedCategory } from '@pos/categories/data-access';
import { UIS3Image } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

export interface CategorySelectionProps {
    onSelected: (c?: CategoryEntity) => void;
}

interface CategoryTileProps {
    item: CategoryEntity;
    isSelected: boolean;
    onPress: (item: CategoryEntity) => void;
}

const CategoryTile = React.memo(function CategoryTile({
    item,
    isSelected,
    onPress,
}: CategoryTileProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);

    return (
        <Pressable
            testID={`sales-category-${item.id || item.name}`}
            onPress={() => onPress(item)}
            style={[styles.itemCard, isSelected && styles.itemCardSelected]}
        >
            <View style={styles.imageWrap}>
                <UIS3Image s3Key={item.picture} width={42} height={42} factor={1.5} />
            </View>
            <Text
                numberOfLines={2}
                style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}
            >
                {item.name}
            </Text>
        </Pressable>
    );
});

export function CategorySelection({ onSelected }: CategorySelectionProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const categories = useSelector(selectAllCategories);
    const selected = useSelector(selectedCategory);
    const dispatch = useDispatch();
    const selectedId = selected?.id;

    const onSelection = useCallback((item: CategoryEntity) => {
        if (selectedId === item.id) {
            onSelected(undefined);
            dispatch(categoriesActions.clearSelection());
            return;
        }

        onSelected(item);
        dispatch(categoriesActions.select(item));
    }, [dispatch, onSelected, selectedId]);

    const renderCategory = useCallback(
        ({ item }: { item: CategoryEntity }) => (
            <CategoryTile
                item={item}
                isSelected={selectedId === item.id}
                onPress={onSelection}
            />
        ),
        [onSelection, selectedId]
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id || item.name}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={7}
                removeClippedSubviews
                renderItem={renderCategory}
            />
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        listContent: {
            paddingBottom: tokens.spacing.sm,
        },
        itemCard: {
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            paddingVertical: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.xs,
            marginBottom: tokens.spacing.xs,
            alignItems: 'center',
        },
        itemCardSelected: {
            backgroundColor: `${tokens.colors.accent}22`,
            borderColor: `${tokens.colors.accent}bb`,
        },
        imageWrap: {
            width: 56,
            height: 56,
            borderRadius: tokens.radii.sm,
            backgroundColor: tokens.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacing.xs,
        },
        itemLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 12,
            fontWeight: '700',
            textAlign: 'center',
            lineHeight: 16,
            minHeight: 32,
        },
        itemLabelSelected: {
            color: tokens.colors.accent,
        },
    });

export default CategorySelection;
