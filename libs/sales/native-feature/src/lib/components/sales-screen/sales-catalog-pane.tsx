import React from 'react';
import { Animated, Text, TextInput, View } from 'react-native';
import { Button } from '@rneui/themed';
import { ButtonItemType, UICard } from '@pos/shared/ui-native';
import { ProductEntity } from '@pos/products/data-access';
import CategorySelection from '../category-selection/category-selection';
import ProductSelection from '../product-selection/product-selection';
import { ProductSearch } from '../product-search/product-search';
import { CategoryEntity } from '@pos/categories/data-access';
import { SalesScreenStyles } from './sales-screen.styles';
import { translateWithFallback } from '@pos/shared/utils';

interface SalesCatalogPaneProps {
    styles: SalesScreenStyles;
    accentColor: string;
    showCategories: boolean;
    hasCatalogProducts: boolean;
    canManageCatalog: boolean;
    filteredProducts: ProductEntity[];
    filteredProductCount: number;
    categoryWidth: Animated.Value;
    categoryOpacity: Animated.Value;
    contentOpacity: Animated.Value;
    searchRef: React.RefObject<TextInput>;
    onCategoryChange: (category?: CategoryEntity) => void;
    onShowAllProducts: () => void;
    showAllProducts: boolean;
    selectedCategoryId?: string;
    categoryRefreshToken?: number;
    onToggleCategories: () => void;
    onFilterChange: (text: string) => Promise<string | void>;
    onProductSelected: (product: ButtonItemType) => void;
    onProductLongPress: (product: ButtonItemType) => void;
    onOpenBackOfficeForm: (screen: 'Products' | 'Categories', initialRouteName: string) => void;
    onOpenCurrentDeals: () => void;
}

export function SalesCatalogPane({
    styles,
    accentColor,
    showCategories,
    hasCatalogProducts,
    canManageCatalog,
    filteredProducts,
    filteredProductCount,
    categoryWidth,
    categoryOpacity,
    contentOpacity,
    searchRef,
    onCategoryChange,
    onShowAllProducts,
    showAllProducts,
    selectedCategoryId,
    categoryRefreshToken,
    onToggleCategories,
    onFilterChange,
    onProductSelected,
    onProductLongPress,
    onOpenBackOfficeForm,
    onOpenCurrentDeals,
}: SalesCatalogPaneProps) {
    const t = translateWithFallback;
    return (
        <>
            <Animated.View
                style={[
                    styles.categoriesCardWrap,
                    {
                        width: categoryWidth,
                        opacity: categoryOpacity,
                        marginRight: showCategories ? 12 : 0,
                    },
                ]}
            >
                <View style={styles.categoriesCard}>
                    {showCategories ? (
                        <CategorySelection
                            key="categorySelection"
                            onSelected={onCategoryChange}
                            onShowAll={onShowAllProducts}
                            showAllSelected={showAllProducts}
                            selectedCategoryId={selectedCategoryId}
                            refreshToken={categoryRefreshToken}
                        />
                    ) : null}
                </View>
            </Animated.View>
            <UICard style={styles.productsCard} padding="md" radius="lg">
                <View style={styles.productsHeader}>
                    <View style={styles.productsHeaderCopy}>
                        <View style={styles.sectionTitleRow}>
                            <Button
                                testID="sales-toggle-categories"
                                type="clear"
                                onPress={onToggleCategories}
                                accessibilityLabel={
                                    showCategories
                                        ? t('SALES_HideCategories', 'Hide categories')
                                        : t('SALES_ShowCategories', 'Show categories')
                                }
                                icon={{
                                    name: showCategories ? 'dock-right' : 'dock-left',
                                    type: 'material-community',
                                    color: accentColor,
                                    size: 20,
                                }}
                                buttonStyle={styles.toggleIconButton}
                            />
                            <Text style={styles.sectionTitle}>
                                {t('COMMON_Products', 'Products')}
                            </Text>
                        </View>
                        <Text style={styles.sectionSubtitle}>
                            {showCategories
                                ? t(
                                      'SALES_CatalogWithCategories',
                                      'Choose a category, tap All Products, or search the catalog.'
                                  )
                                : t(
                                      'SALES_CatalogWithoutCategories',
                                      'Search the catalog or show categories again.'
                                  )}
                        </Text>
                    </View>
                    <View style={styles.productsHeaderActions}>
                        <View style={styles.productsCountBadge}>
                            <Text style={styles.productsCountBadgeText}>
                                {t('SALES_VisibleCount', '{{count}} visible', {
                                    count: filteredProductCount,
                                })}
                            </Text>
                        </View>
                        <Button
                            testID="sales-current-deals"
                            type="outline"
                            title={t('SALES_CurrentDeals', 'Current deals')}
                            onPress={onOpenCurrentDeals}
                            icon={{
                                name: 'tag-multiple-outline',
                                type: 'material-community',
                                color: accentColor,
                                size: 18,
                            }}
                            titleStyle={styles.currentDealsTitle}
                            buttonStyle={styles.currentDealsButton}
                        />
                    </View>
                </View>

                <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
                    {hasCatalogProducts ? (
                        <>
                            <ProductSearch
                                key="productSearch"
                                ref={searchRef}
                                onFilterChange={onFilterChange}
                            />
                            <ProductSelection
                                key="productSelection"
                                products={filteredProducts}
                                onSelected={onProductSelected}
                                onLongPress={onProductLongPress}
                            />
                        </>
                    ) : (
                        <View style={styles.emptyCatalogWrap}>
                            <Text style={styles.emptyTitle}>
                                {t('SALES_NoProductsYet', 'No products yet')}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {t(
                                    'SALES_NoProductsYetSubtitle',
                                    'Add your first category or product in Back Office before using sales search.'
                                )}
                            </Text>
                            {canManageCatalog ? (
                                <View style={styles.emptyActions}>
                                    <Button
                                        testID="sales-empty-add-category"
                                        title={t('SALES_AddCategory', 'Add category')}
                                        onPress={() =>
                                            onOpenBackOfficeForm('Categories', 'Category Form')
                                        }
                                        buttonStyle={styles.primaryAction}
                                        titleStyle={styles.primaryActionTitle}
                                        icon={{
                                            name: 'shape-outline',
                                            type: 'material-community',
                                            color: '#ffffff',
                                            size: 18,
                                        }}
                                    />
                                    <Button
                                        testID="sales-empty-add-product"
                                        title={t('SALES_AddProduct', 'Add product')}
                                        type="outline"
                                        onPress={() =>
                                            onOpenBackOfficeForm('Products', 'Product Form')
                                        }
                                        buttonStyle={styles.secondaryAction}
                                        titleStyle={styles.secondaryActionTitle}
                                        icon={{
                                            name: 'plus-box-outline',
                                            type: 'material-community',
                                            color: accentColor,
                                            size: 18,
                                        }}
                                    />
                                </View>
                            ) : null}
                        </View>
                    )}
                </Animated.View>
            </UICard>
        </>
    );
}
