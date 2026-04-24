import React, { useCallback } from 'react';
import { CategoryEntity, selectAllCategories } from '@pos/categories/data-access';
import { UIEmptyState, UIS3Image } from '@pos/shared/ui-native';
import { translateWithFallback } from '@pos/shared/utils';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

export interface CategorySelectionProps {
    onSelected: (c?: CategoryEntity) => void;
    onShowAll?: () => void;
    showAllSelected?: boolean;
    selectedCategoryId?: string;
    refreshToken?: number;
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
            accessibilityState={{ selected: isSelected }}
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

export function CategorySelection({
    onSelected,
    onShowAll,
    showAllSelected = false,
    selectedCategoryId,
    refreshToken = 0,
}: CategorySelectionProps) {
    const t = translateWithFallback;
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const categories = useSelector(selectAllCategories);

    const onSelection = useCallback(
        (item: CategoryEntity) => {
            if (item.id && selectedCategoryId === item.id) {
                onSelected(undefined);
                return;
            }

            onSelected(item);
        },
        [onSelected, selectedCategoryId]
    );

    const renderCategory = useCallback(
        ({ item }: { item: CategoryEntity }) => (
            <CategoryTile
                item={item}
                isSelected={selectedCategoryId === item.id}
                onPress={onSelection}
            />
        ),
        [onSelection, selectedCategoryId]
    );

    return (
        <View style={styles.container}>
            {!categories.length ? (
                <View style={styles.emptyWrap}>
                    <UIEmptyState
                        text={t('SALES_NoCategoriesYet', 'No categories yet')}
                        imageSize={150}
                    />
                </View>
            ) : null}
            {categories.length ? (
                <Pressable
                    testID="sales-category-all"
                    onPress={() => onShowAll?.()}
                    accessibilityState={{ selected: showAllSelected }}
                    style={[
                        styles.itemCard,
                        styles.allCard,
                        showAllSelected && styles.itemCardSelected,
                    ]}
                >
                    <Text
                        numberOfLines={2}
                        style={[
                            styles.itemLabel,
                            showAllSelected && styles.itemLabelSelected,
                        ]}
                    >
                        {t('SALES_AllProducts', 'All Products')}
                    </Text>
                </Pressable>
            ) : null}
            <FlatList
                testID="sales-category-list"
                data={categories}
                keyExtractor={(item) => item.id || item.name}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                extraData={`${selectedCategoryId ?? ''}:${String(showAllSelected)}:${refreshToken}`}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={7}
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
        emptyWrap: {
            marginTop: tokens.spacing.xl,
            marginBottom: tokens.spacing.lg,
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
        allCard: {
            minHeight: 72,
            justifyContent: 'center',
            marginBottom: tokens.spacing.sm,
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
            fontSize: 11,
            fontWeight: '700',
            textAlign: 'center',
            lineHeight: 14,
            minHeight: 32,
        },
        itemLabelSelected: {
            color: tokens.colors.accent,
        },
    });

export default CategorySelection;
