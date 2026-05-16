import React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { Button } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrinterEntity } from '@pos/printings/data-access';
import { UICard } from '@pos/shared/ui-native';
import { translateWithFallback } from '@pos/shared/utils';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface PrinterItemProps {
    item: PrinterEntity;
    navigation: NativeStackNavigationProp<any>;
    defaultPrinter?: PrinterEntity;
    setAsDefault?: (printer: PrinterEntity) => void;
}

function InfoBox(props: { label?: string; value: string | null | undefined }) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);

    return (
        <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>{props.label}</Text>
            <Text style={styles.infoValue}>{props.value || '-'}</Text>
        </View>
    );
}

export function PrinterItem({
    item,
    navigation,
    defaultPrinter,
    setAsDefault,
}: PrinterItemProps) {
    const t = translateWithFallback;
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const isDefault = defaultPrinter?.identifier === item.identifier;

    return (
        <UICard style={[styles.card, isDefault && styles.defaultCard]}>
            <View style={styles.contentRow}>
                <View style={styles.infoGrid}>
                    <InfoBox
                        label={t('PRINTER_Model', 'Model')}
                        value={item.model}
                    />
                    <InfoBox
                        label={t('PRINTER_Identifier', 'Identifier')}
                        value={item.identifier}
                    />
                    <InfoBox
                        label={t('PRINTER_IpAddress', 'IP Address')}
                        value={item.ip}
                    />
                    <InfoBox
                        label={t('PRINTER_Interface', 'Interface')}
                        value={item.interfaceType}
                    />
                </View>
                <View style={styles.actionColumn}>
                    {!isDefault && setAsDefault && (
                        <Button
                            type="outline"
                            title={t('PRINTER_SetAsDefault', 'Set as Default')}
                            onPress={() => setAsDefault(item)}
                            buttonStyle={styles.defaultButton}
                            titleStyle={styles.defaultButtonTitle}
                        />
                    )}
                    {isDefault && (
                        <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>
                                {t('PRINTER_DefaultPrinter', 'Default Printer')}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </UICard>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        card: {
            borderColor: '#1D2A3B',
            backgroundColor: '#0B1119',
        },
        defaultCard: {
            borderColor: `${tokens.colors.success}66`,
            backgroundColor: `${tokens.colors.success}0D`,
        },
        contentRow: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: tokens.spacing.md,
        },
        infoGrid: {
            flex: 1,
            flexDirection: 'row',
            gap: tokens.spacing.sm,
        },
        infoBox: {
            flex: 1,
            minWidth: 0,
        },
        infoLabel: {
            color: tokens.colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.8,
            marginBottom: 5,
            textTransform: 'uppercase',
        },
        infoValue: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '700',
        },
        actionColumn: {
            alignItems: 'flex-end',
            minWidth: 180,
        },
        defaultButton: {
            borderRadius: 18,
            paddingHorizontal: tokens.spacing.md,
        },
        defaultButtonTitle: {
            fontSize: 13,
            fontWeight: '800',
        },
        defaultBadge: {
            borderRadius: 999,
            backgroundColor: tokens.colors.success,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: 8,
        },
        defaultBadgeText: {
            color: '#ffffff',
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
        },
    });
