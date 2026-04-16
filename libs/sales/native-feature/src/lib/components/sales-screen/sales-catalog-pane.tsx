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

interface SalesCatalogPaneProps {
    styles: SalesScreenStyles;
    accentColor: string;
    showCategories: boolean;
    hasCatalogProducts: boolean;
    canManageCatalog: boolean;
    filteredProducts: ProductEntity[];
    enforceSalesBasedOnInventory?: boolean;
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
}

export function SalesCatalogPane({
    styles,
    accentColor,
    showCategories,
    hasCatalogProducts,
    canManageCatalog,
    filteredProducts,
    enforceSalesBasedOnInventory,
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
}: SalesCatalogPaneProps) {
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
                    <View>
                        <Text style={styles.sectionTitle}>Products</Text>
                        <Text style={styles.sectionSubtitle}>
                            {showCategories
                                ? 'Choose a category, tap All Products, or search the catalog.'
                                : 'Search the catalog or show categories again.'}
                        </Text>
                    </View>
                    <Button
                        testID="sales-toggle-categories"
                        type="clear"
                        title={showCategories ? 'Hide categories' : 'Show categories'}
                        onPress={onToggleCategories}
                        icon={{
                            name: showCategories ? 'dock-right' : 'dock-left',
                            type: 'material-community',
                            color: accentColor,
                            size: 18,
                        }}
                        titleStyle={styles.toggleTitle}
                        buttonStyle={styles.toggleButton}
                    />
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
                                enforceSalesBasedOnInventory={
                                    enforceSalesBasedOnInventory
                                }
                                onSelected={onProductSelected}
                                onLongPress={onProductLongPress}
                            />
                        </>
                    ) : (
                        <View style={styles.emptyCatalogWrap}>
                            <Text style={styles.emptyTitle}>No products yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Add your first category or product in Back Office before using sales
                                search.
                            </Text>
                            {canManageCatalog ? (
                                <View style={styles.emptyActions}>
                                    <Button
                                        testID="sales-empty-add-category"
                                        title="Add category"
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
                                        title="Add product"
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
