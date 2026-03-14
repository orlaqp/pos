import {
    DateRange,
    UICard,
    UIDateRange,
    UIEmptyState,
    UIScreen,
    UISpinner,
    UIStack,
} from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import * as RNFS from 'react-native-fs';
import { Icon } from '@rneui/themed';
import i18next from 'i18next';

import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Share } from 'react-native';

export interface ReportHeader {
    label: string;
    field: string;
    format?: 'string' | 'integer' | 'float' | 'money';
    width: number;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
    sum?: boolean;
}

/* eslint-disable-next-line */
export interface ReportViewerProps {
    total: number;
    headers: ReportHeader[];
    getData: (range: DateRange) => Promise<any[]>;
    title?: string;
    subtitle?: string;
}

const formatCellValue = (
    value: unknown,
    format?: ReportHeader['format']
) => {
    if (format === 'money') {
        const amount = Number(value || 0);
        return `$${amount.toFixed(2)}`;
    }

    if (value === undefined || value === null) return '-';
    return String(value);
};

const getRowKey = (item: Record<string, unknown>, index: number) =>
    String(item.id || item.orderNo || item.orderDate || index);

const escapeCsv = (value: unknown) => {
    const normalized = value === null || value === undefined ? '' : String(value);
    const escaped = normalized.replace(/"/g, '""');
    return `"${escaped}"`;
};

export const buildReportCsv = (
    headers: ReportHeader[],
    items: Record<string, unknown>[],
    totals?: Record<string, number>,
    totalLabel = 'TOTAL'
) => {
    const lines: string[] = [];
    lines.push(headers.map((h) => escapeCsv(h.label)).join(','));

    items.forEach((item) => {
        lines.push(
            headers
                .map((h) => escapeCsv(formatCellValue(item[h.field], h.format)))
                .join(',')
        );
    });

    if (totals) {
        const totalRow = headers.map((h, index) => {
            if (h.sum) return escapeCsv(formatCellValue(totals[h.field], h.format));
            if (index === 0) return escapeCsv(totalLabel);
            return escapeCsv('');
        });
        lines.push(totalRow.join(','));
    }

    return lines.join('\n');
};

const toSafeFileSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function ReportViewer({
    getData,
    headers,
    title = 'Sales Report',
    subtitle = 'Filter by date range to review transactions.',
}: ReportViewerProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const [loading, setLoading] = useState<boolean>(true);
    const [totals, setTotals] = useState<Record<string, number>>();
    const [items, setItems] = useState<any[]>([]);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    });
    const selectedRangeLabel = `${dateRange.startDate.format('MM-DD-YYYY')}  ->  ${dateRange.endDate.format(
        'MM-DD-YYYY'
    )}`;

    const exportToCsv = async () => {
        try {
            const filename = `${toSafeFileSlug(title || 'report')}-${moment().format(
                'YYYYMMDD-HHmmss'
            )}.csv`;
            const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
            const csv = buildReportCsv(
                headers,
                items as Record<string, unknown>[],
                totals,
                t('REPORT_TotalLabel', 'TOTAL')
            );

            await RNFS.writeFile(path, csv, 'utf8');
            await Share.share({
                title: filename,
                url: `file://${path}`,
            });
        } catch {
            Alert.alert(
                t('REPORT_ExportFailedTitle', 'Export failed'),
                t('REPORT_ExportFailedMessage', 'Could not generate CSV file.')
            );
        }
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        getData(dateRange)
            .then((res) => {
                if (!cancelled) {
                    setItems(res || []);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setItems([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [getData, dateRange]);

    useEffect(() => {
        if (!items.length) {
            setTotals(undefined);
            return;
        }

        const totals: Record<string, number> = {};
        items.reduce((total, item) => {
            headers.forEach((h) => {
                if (h.sum) {
                    total[h.field] = (total[h.field] || 0) + Number(item[h.field] || 0);
                }
            });

            return total;
        }, totals);

        setTotals(totals);
    }, [headers, items]);

    return (
        <UIScreen padded>
            <View style={styles.screen}>
                <View style={styles.container}>
                    <UIStack spacing="lg">
                        <UICard tone="muted" radius="lg">
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.subtitle}>{subtitle}</Text>
                            <UIDateRange
                                initialRange={dateRange}
                                onRangeChange={setDateRange}
                                showSummary={false}
                                rightAction={
                                    <Pressable
                                        testID="report-export-csv-btn"
                                        style={styles.exportButton}
                                        onPress={exportToCsv}
                                    >
                                        <Icon
                                            name="download-outline"
                                            type="ionicon"
                                            size={14}
                                            color={tokens.colors.accent}
                                        />
                                        <Text style={styles.exportButtonText}>
                                            {t('REPORT_Export', 'Export')}
                                        </Text>
                                    </Pressable>
                                }
                            />
                        </UICard>

                        <View style={styles.reportCardWrap}>
                            <View style={styles.rangeTagWrap}>
                                <View style={styles.rangeTag}>
                                    <Text style={styles.rangeTagText}>{selectedRangeLabel}</Text>
                                </View>
                            </View>
                            <UICard>
                                <View style={styles.tableHeaderRow}>
                                    {headers.map((h) => (
                                        <View key={h.field} style={[styles.colCell, { flex: h.width }]}>
                                            <Text style={[styles.colHeader, { textAlign: h.align }]}>
                                                {h.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {loading && (
                                    <View style={styles.stateWrap}>
                                        <UISpinner
                                            size="small"
                                            message={t('COMMON_Loading', 'Loading...')}
                                        />
                                    </View>
                                )}

                                {!loading && !items.length && (
                                    <View style={styles.stateWrap}>
                                        <UIEmptyState
                                            text={t(
                                                'REPORT_NoSalesForRange',
                                                'No sales found for this date range'
                                            )}
                                        />
                                    </View>
                                )}

                                {!loading && !!items.length && (
                                    <>
                                        <FlatList
                                            data={items}
                                            keyExtractor={(item, index) =>
                                                getRowKey(item as Record<string, unknown>, index)
                                            }
                                            renderItem={({ item }) => (
                                                <View style={styles.dataRow}>
                                                    {headers.map((h) => (
                                                        <View key={h.field} style={[styles.colCell, { flex: h.width }]}>
                                                            <Text style={[styles.colValue, { textAlign: h.align }]}>
                                                                {formatCellValue(item[h.field], h.format)}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        />

                                        {!!totals && (
                                            <View style={styles.totalRow}>
                                                {headers.map((h) => (
                                                    <View key={h.field} style={[styles.colCell, { flex: h.width }]}>
                                                        <Text
                                                            style={[
                                                                styles.totalValue,
                                                                { textAlign: h.align },
                                                            ]}
                                                        >
                                                            {h.sum
                                                                ? formatCellValue(
                                                                      totals[h.field],
                                                                      h.format
                                                                  )
                                                                : ''}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </>
                                )}
                            </UICard>
                        </View>
                    </UIStack>
                </View>
            </View>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        screen: {
            flex: 1,
        },
        container: {
            width: '100%',
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 26,
            fontWeight: '700',
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            marginTop: tokens.spacing.xs,
            marginBottom: tokens.spacing.sm,
        },
        exportButton: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}99`,
            backgroundColor: `${tokens.colors.accent}22`,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
        },
        exportButtonText: {
            color: tokens.colors.accent,
            fontSize: 13,
            fontWeight: '700',
            marginLeft: tokens.spacing.xs,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
        },
        tableHeaderRow: {
            flexDirection: 'row',
            paddingTop: tokens.spacing.md,
            paddingBottom: tokens.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: tokens.colors.border,
        },
        reportCardWrap: {
            position: 'relative',
            paddingTop: tokens.spacing.sm,
        },
        rangeTagWrap: {
            position: 'absolute',
            top: 0,
            width: '100%',
            alignItems: 'center',
            zIndex: 2,
        },
        rangeTag: {
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: `${tokens.colors.warning}99`,
            backgroundColor: `${tokens.colors.warning}22`,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: 5,
        },
        rangeTagText: {
            color: tokens.colors.warning,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.3,
        },
        colCell: {
            paddingHorizontal: tokens.spacing.sm,
        },
        colHeader: {
            color: tokens.colors.textMuted,
            fontSize: 14,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
        },
        dataRow: {
            flexDirection: 'row',
            paddingVertical: tokens.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: `${tokens.colors.border}66`,
        },
        colValue: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
        },
        totalRow: {
            flexDirection: 'row',
            marginTop: tokens.spacing.sm,
            paddingTop: tokens.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: tokens.colors.border,
        },
        totalValue: {
            color: tokens.colors.textPrimary,
            fontSize: 17,
            fontWeight: '700',
        },
        stateWrap: {
            minHeight: 160,
            justifyContent: 'center',
        },
    });

export default ReportViewer;
