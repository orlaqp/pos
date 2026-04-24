import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React from 'react';
import { translateWithFallback } from '@pos/shared/utils';

import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

/* eslint-disable-next-line */
export interface ListWidgetProps {
    header: string;
    items: { name: string; value: string; }[]
}

export function ListWidget({ header, items }: ListWidgetProps) {
    const t = translateWithFallback;
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);

    return (
        <View style={local.card}>
            <Text style={local.eyebrow}>{t('COMMON_Summary', 'Summary')}</Text>
            <Text style={local.header}>{header}</Text>
            <ScrollView contentContainerStyle={local.listContent}>
                {!items.length && (
                    <View style={local.emptyRow}>
                        <Text style={local.emptyText}>
                            {t('COMMON_NoRowsToShow', 'No rows to show')}
                        </Text>
                    </View>
                )}
                {items.map((item, idx) => (
                    <View
                        key={idx}
                        style={[
                            local.row,
                            idx % 2 === 1 && local.rowAlt,
                        ]}
                    >
                        <Text
                            style={[
                                styles.primaryText,
                                local.nameText,
                            ]}
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                        <Text
                            style={[
                                styles.primaryText,
                                styles.textRight,
                                local.valueText,
                            ]}
                        >
                            {item.value}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        card: {
            height: 220,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#243145',
            backgroundColor: '#090D14',
            paddingHorizontal: tokens.spacing.lg,
            paddingVertical: tokens.spacing.md,
        },
        eyebrow: {
            color: tokens.colors.accent,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 1.4,
            marginBottom: 2,
            textTransform: 'uppercase',
        },
        header: {
            color: tokens.colors.textPrimary,
            fontSize: 17,
            fontWeight: '800',
            marginBottom: tokens.spacing.sm,
        },
        listContent: {
            paddingBottom: tokens.spacing.sm,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 14,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            marginBottom: tokens.spacing.xs,
        },
        rowAlt: {
            backgroundColor: '#101722',
        },
        nameText: {
            flex: 2,
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '600',
        },
        valueText: {
            flex: 1,
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
        },
        emptyRow: {
            minHeight: 110,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            color: tokens.colors.textMuted,
            fontSize: 14,
            fontWeight: '700',
        },
    });

export default ListWidget;
