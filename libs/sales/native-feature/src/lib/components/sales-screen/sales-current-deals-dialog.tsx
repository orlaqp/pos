import React from 'react';
import { Button, Dialog } from '@rneui/themed';
import { UIEmptyState } from '@pos/shared/ui-native';
import { ScrollView, Text, View } from 'react-native';
import { translateWithFallback } from '@pos/shared/utils';

import { SalesDiscountExplainerRow } from './current-deals.logic';

interface SalesCurrentDealsDialogProps {
    isVisible: boolean;
    rows: SalesDiscountExplainerRow[];
    selectedProductName?: string | null;
    overlayStyle: object;
    styles: {
        dealsDialog: object;
        dealsDialogHero: object;
        dealsDialogMetaRow: object;
        dealsDialogMetaCard: object;
        dealsDialogMetaLabel: object;
        dealsDialogMetaValue: object;
        dealsDialogScroll: object;
        dealsDialogContent: object;
        dealsSection: object;
        dealsSectionTitle: object;
        dealsCard: object;
        dealsBadgeRow: object;
        dealsBadge: object;
        dealsBadgeText: object;
        dealsTitle: object;
        dealsSubtitle: object;
        dealsDialogFooter: object;
        dealsDialogTitle: object;
        dealsDialogSubtitle: object;
        dealsDialogEyebrow: object;
    };
    onClose: () => void;
}

export function SalesCurrentDealsDialog({
    isVisible,
    rows,
    selectedProductName,
    overlayStyle,
    styles,
    onClose,
}: SalesCurrentDealsDialogProps) {
    const t = translateWithFallback;
    const relevantRows = rows.filter((row) => row.group === 'relevant');
    const otherRows = rows.filter((row) => row.group === 'other');

    return (
        <Dialog
            isVisible={isVisible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            overlayStyle={overlayStyle}
        >
            <View style={styles.dealsDialogHero}>
                <Text style={styles.dealsDialogEyebrow}>
                    {t('SALES_SupportEyebrow', 'Sales support')}
                </Text>
                <Text style={styles.dealsDialogTitle}>
                    {t('SALES_CurrentDeals', 'Current deals')}
                </Text>
                <Text style={styles.dealsDialogSubtitle}>
                    {selectedProductName
                        ? t(
                              'SALES_CurrentDealsSelectedSubtitle',
                              'Staff-friendly summary of active offers, with {{productName}} highlighted first.',
                              { productName: selectedProductName }
                          )
                        : t(
                              'SALES_CurrentDealsSubtitle',
                              'Staff-friendly summary of the discounts customers can use right now.'
                          )}
                </Text>
                <View style={styles.dealsDialogMetaRow}>
                    <View style={styles.dealsDialogMetaCard}>
                        <Text style={styles.dealsDialogMetaLabel}>
                            {t('SALES_ActiveOffers', 'Active offers')}
                        </Text>
                        <Text style={styles.dealsDialogMetaValue}>{rows.length}</Text>
                    </View>
                    <View style={styles.dealsDialogMetaCard}>
                        <Text style={styles.dealsDialogMetaLabel}>
                            {t('SALES_SelectedProduct', 'Selected product')}
                        </Text>
                        <Text style={styles.dealsDialogMetaValue}>
                            {selectedProductName || t('SALES_StorewideView', 'Storewide view')}
                        </Text>
                    </View>
                </View>
            </View>

            {!rows.length ? (
                <UIEmptyState
                    title={t('SALES_NoCurrentDeals', 'No current deals')}
                    subtitle={t(
                        'SALES_NoCurrentDealsSubtitle',
                        'Active automatic discounts and promo offers will appear here when they are available right now.'
                    )}
                    containerStyle={styles.dealsDialog}
                    contentStyle={styles.dealsDialogContent}
                />
            ) : (
                <ScrollView
                    style={styles.dealsDialogScroll}
                    contentContainerStyle={styles.dealsDialogContent}
                    showsVerticalScrollIndicator={false}
                >
                    {relevantRows.length ? (
                        <View style={styles.dealsSection}>
                            <Text style={styles.dealsSectionTitle}>
                                {t(
                                    'SALES_RelevantToSelectedProduct',
                                    'Relevant to selected product'
                                )}
                            </Text>
                            {relevantRows.map((row) => (
                                <View key={row.id} style={styles.dealsCard}>
                                    <View style={styles.dealsBadgeRow}>
                                        <View style={styles.dealsBadge}>
                                            <Text style={styles.dealsBadgeText}>
                                                {row.type === 'PROMO_CODE'
                                                    ? t('SALES_PromoCode', 'Promo code')
                                                    : t('SALES_Automatic', 'Automatic')}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.dealsTitle}>{row.title}</Text>
                                    <Text style={styles.dealsSubtitle}>{row.subtitle}</Text>
                                </View>
                            ))}
                        </View>
                    ) : null}

                    {otherRows.length ? (
                        <View style={styles.dealsSection}>
                            <Text style={styles.dealsSectionTitle}>
                                {relevantRows.length
                                    ? t('SALES_OtherCurrentDeals', 'Other current deals')
                                    : t('SALES_CurrentDeals', 'Current deals')}
                            </Text>
                            {otherRows.map((row) => (
                                <View key={row.id} style={styles.dealsCard}>
                                    <View style={styles.dealsBadgeRow}>
                                        <View style={styles.dealsBadge}>
                                            <Text style={styles.dealsBadgeText}>
                                                {row.type === 'PROMO_CODE'
                                                    ? t('SALES_PromoCode', 'Promo code')
                                                    : t('SALES_Automatic', 'Automatic')}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.dealsTitle}>{row.title}</Text>
                                    <Text style={styles.dealsSubtitle}>{row.subtitle}</Text>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </ScrollView>
            )}

            <View style={styles.dealsDialogFooter}>
                <Button title={t('COMMON_Close', 'Close')} type="clear" onPress={onClose} />
            </View>
        </Dialog>
    );
}

export default SalesCurrentDealsDialog;
