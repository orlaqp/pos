import {
    DateRange,
    UICard,
    UIDateRange,
    UIScreen,
    UISpinner,
    UIStack,
} from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import * as RNFS from 'react-native-fs';
import { Icon } from '@rneui/themed';
import i18next from 'i18next';

import {
    Alert,
    Animated,
    FlatList,
    InteractionManager,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { Share } from 'react-native';

export interface ReportHeader {
    label: string;
    field: string;
    format?: 'string' | 'integer' | 'float' | 'money';
    width: number;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
    sum?: boolean;
}

type SortDirection = 'asc' | 'desc';

interface SortState {
    field: string;
    direction: SortDirection;
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

const getCellAlignment = (header: ReportHeader) => {
    if (header.align && header.align !== 'auto') return header.align;
    if (
        header.format === 'money' ||
        header.format === 'integer' ||
        header.format === 'float'
    ) {
        return 'right';
    }

    return 'left';
};

const getComparableValue = (value: unknown, format?: ReportHeader['format']) => {
    if (value === undefined || value === null) return '';
    if (format === 'money' || format === 'integer' || format === 'float') {
        return Number(value || 0);
    }
    return String(value).toLowerCase();
};

export const filterReportItems = (
    items: Record<string, unknown>[],
    headers: ReportHeader[],
    query: string
) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) =>
        headers.some((header) => {
            const rawValue = item[header.field];
            const formatted = formatCellValue(rawValue, header.format).toLowerCase();
            return formatted.includes(normalized);
        })
    );
};

export const sortReportItems = (
    items: Record<string, unknown>[],
    headers: ReportHeader[],
    sortState: SortState | null
) => {
    if (!sortState) return items;
    const header = headers.find((candidate) => candidate.field === sortState.field);
    if (!header) return items;

    const direction = sortState.direction === 'asc' ? 1 : -1;

    return [...items].sort((left, right) => {
        const leftValue = getComparableValue(left[header.field], header.format);
        const rightValue = getComparableValue(right[header.field], header.format);

        if (leftValue < rightValue) return -1 * direction;
        if (leftValue > rightValue) return 1 * direction;
        return 0;
    });
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
    title,
    subtitle,
}: ReportViewerProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const { height: windowHeight } = useWindowDimensions();
    const [loading, setLoading] = useState<boolean>(true);
    const [items, setItems] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [sortState, setSortState] = useState<SortState | null>(null);
    const [emptyOpacity] = useState(() => new Animated.Value(0));
    const [emptyTranslateY] = useState(() => new Animated.Value(12));
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const resolvedTitle = title || t('REPORT_DefaultTitle', 'Sales Report');
    const resolvedSubtitle =
        subtitle ||
        t(
            'REPORT_DefaultSubtitle',
            'Filter by date range to review transactions.'
        );
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    });
    const selectedRangeLabel = `${dateRange.startDate.format('MM-DD-YYYY')}  ->  ${dateRange.endDate.format(
        'MM-DD-YYYY'
    )}`;
    const tableHeight = Math.max(
        240,
        Math.min(560, Math.round(windowHeight * 0.48))
    );
    const filteredItems = useMemo(
        () => filterReportItems(items, headers, debouncedQuery),
        [debouncedQuery, headers, items]
    );
    const visibleItems = useMemo(
        () => sortReportItems(filteredItems, headers, sortState),
        [filteredItems, headers, sortState]
    );
    const totals = useMemo(() => {
        if (!visibleItems.length) {
            return undefined;
        }

        return visibleItems.reduce<Record<string, number>>((total, item) => {
            headers.forEach((h) => {
                if (h.sum) {
                    total[h.field] =
                        (total[h.field] || 0) + Number(item[h.field] || 0);
                }
            });

            return total;
        }, {});
    }, [headers, visibleItems]);

    const toggleSort = (field: string) => {
        setSortState((current) => {
            if (!current || current.field !== field) {
                return { field, direction: 'asc' };
            }

            return {
                field,
                direction: current.direction === 'asc' ? 'desc' : 'asc',
            };
        });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query);
        }, 325);

        return () => clearTimeout(timeout);
    }, [query]);

    const exportToCsv = async () => {
        try {
            const filename = `${toSafeFileSlug(resolvedTitle || 'report')}-${moment().format(
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

    const handleRangeChange = (range: DateRange) => {
        setLoading(true);
        setDateRange(range);
    };

    useEffect(() => {
        let cancelled = false;
        const task = InteractionManager.runAfterInteractions(() => {
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
        });

        return () => {
            cancelled = true;
            task.cancel?.();
        };
    }, [getData, dateRange]);

    useEffect(() => {
        if (loading || visibleItems.length) return;

        emptyOpacity.setValue(0);
        emptyTranslateY.setValue(12);
        Animated.parallel([
            Animated.timing(emptyOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(emptyTranslateY, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start();
    }, [emptyOpacity, emptyTranslateY, loading, visibleItems.length]);

    return (
        <UIScreen padded>
            <View style={styles.screen}>
                <View style={styles.container}>
                    <UIStack spacing="lg">
                        <UICard tone="muted" radius="lg" style={styles.headerCard}>
                            <View style={styles.headerCopy}>
                                <Text style={styles.eyebrow}>
                                    {t('REPORT_Eyebrow', 'Report')}
                                </Text>
                                <Text style={styles.title}>{resolvedTitle}</Text>
                                <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
                            </View>
                            <UIDateRange
                                initialRange={dateRange}
                                onRangeChange={handleRangeChange}
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
                            <View style={styles.toolbarRow}>
                                <View style={styles.searchWrap}>
                                    <Icon
                                        name="magnify"
                                        type="material-community"
                                        size={15}
                                        color={tokens.colors.textMuted}
                                    />
                                    <TextInput
                                        value={query}
                                        onChangeText={setQuery}
                                        placeholder={t('REPORT_Search', 'Filter rows')}
                                        placeholderTextColor={tokens.colors.textMuted}
                                        style={styles.searchInput}
                                    />
                                </View>
                                {!!sortState && (
                                    <Pressable style={styles.sortChip} onPress={() => setSortState(null)}>
                                        <Text style={styles.sortChipText}>
                                            {headers.find((header) => header.field === sortState.field)?.label}
                                            {' • '}
                                            {sortState.direction === 'asc'
                                                ? t('REPORT_SortAsc', 'Asc')
                                                : t('REPORT_SortDesc', 'Desc')}
                                        </Text>
                                        <Text style={styles.sortChipClose}>×</Text>
                                    </Pressable>
                                )}
                            </View>
                        </UICard>

                        <View style={styles.reportCardWrap}>
                            <View style={styles.rangeTagWrap} pointerEvents="box-none">
                                <View style={styles.rangeTag} pointerEvents="none">
                                    <Text style={styles.rangeTagText}>{selectedRangeLabel}</Text>
                                </View>
                            </View>
                            <UICard style={styles.tableCard}>
                                {loading && (
                                    <View style={styles.stateWrap}>
                                        <UISpinner
                                            size="small"
                                            message={t('COMMON_Loading', 'Loading...')}
                                        />
                                    </View>
                                )}

                                {!loading && !visibleItems.length && (
                                    <Animated.View
                                        style={[
                                            styles.emptyStateWrap,
                                            {
                                                opacity: emptyOpacity,
                                                transform: [{ translateY: emptyTranslateY }],
                                            },
                                        ]}
                                    >
                                        <Text style={styles.emptyStateTitle}>
                                            {debouncedQuery.trim()
                                                ? t('REPORT_NoFilteredResults', 'No rows match this filter')
                                                : t(
                                                      'REPORT_NoSalesForRange',
                                                      'No data found for this date range'
                                                  )}
                                        </Text>
                                        <Text style={styles.emptyStateSubtitle}>
                                            {debouncedQuery.trim()
                                                ? t(
                                                      'REPORT_NoFilteredResultsSubtitle',
                                                      'Try a different search term or clear the filter.'
                                                  )
                                                : t(
                                                      'REPORT_NoSalesForRangeSubtitle',
                                                      'Completed sales matching the selected filters will appear here.'
                                                  )}
                                        </Text>
                                    </Animated.View>
                                )}

                                {!loading && !!visibleItems.length && (
                                    <>
                                        <View style={styles.tableHeaderRow}>
                                            {headers.map((h) => (
                                                <View key={h.field} style={[styles.colCell, { flex: h.width }]}>
                                                    <Pressable
                                                        style={styles.headerPressable}
                                                        hitSlop={8}
                                                        onPress={() => toggleSort(h.field)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.colHeader,
                                                                { textAlign: getCellAlignment(h) },
                                                            ]}
                                                        >
                                                            {h.label}
                                                        </Text>
                                                        {sortState?.field === h.field && (
                                                            <Text style={styles.sortIndicator}>
                                                                {sortState.direction === 'asc' ? '↑' : '↓'}
                                                            </Text>
                                                        )}
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </View>

                                        <View style={[styles.tableListWrap, { height: tableHeight }]}>
                                            <FlatList
                                                data={visibleItems}
                                                contentContainerStyle={styles.tableListContent}
                                                nestedScrollEnabled
                                                keyboardShouldPersistTaps="handled"
                                                ListFooterComponent={<View style={styles.tableListFooter} />}
                                                keyExtractor={(item, index) =>
                                                    getRowKey(item as Record<string, unknown>, index)
                                                }
                                                renderItem={({ item, index }) => (
                                                    <View
                                                        style={[
                                                            styles.dataRow,
                                                            index % 2 === 1 && styles.dataRowAlt,
                                                        ]}
                                                    >
                                                        {headers.map((h) => (
                                                            <View key={h.field} style={[styles.colCell, { flex: h.width }]}>
                                                                <Text
                                                                    style={[
                                                                        styles.colValue,
                                                                        {
                                                                            textAlign: getCellAlignment(h),
                                                                        },
                                                                    ]}
                                                                >
                                                                    {formatCellValue(item[h.field], h.format)}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            />
                                        </View>

                                        {!!totals && (
                                            <View style={styles.totalRow}>
                                                {headers.map((h) => (
                                                    <View key={h.field} style={[styles.colCell, { flex: h.width }]}>
                                                        <Text
                                                            style={[
                                                                styles.totalValue,
                                                                { textAlign: getCellAlignment(h) },
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
        headerCard: {
            borderRadius: 26,
            borderColor: '#C7D0DB22',
            backgroundColor: '#080B10',
        },
        headerCopy: {
            marginBottom: tokens.spacing.sm,
        },
        eyebrow: {
            color: tokens.colors.accent,
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            marginBottom: 4,
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 30,
            fontWeight: '800',
            letterSpacing: -0.6,
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            marginTop: tokens.spacing.xs,
            marginBottom: tokens.spacing.xs,
            lineHeight: 20,
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
        toolbarRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: tokens.spacing.sm,
            width: '100%',
        },
        searchWrap: {
            flex: 1,
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: `${tokens.colors.border}ee`,
            backgroundColor: '#0C1118',
            paddingHorizontal: tokens.spacing.md,
        },
        searchInput: {
            flex: 1,
            color: tokens.colors.textPrimary,
            marginLeft: tokens.spacing.sm,
            fontSize: 15,
            paddingVertical: tokens.spacing.sm,
        },
        sortChip: {
            marginLeft: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            backgroundColor: '#101D2D',
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}66`,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
        },
        sortChipText: {
            color: tokens.colors.accent,
            fontSize: 13,
            fontWeight: '700',
        },
        sortChipClose: {
            color: '#D7E8FF',
            fontSize: 16,
            fontWeight: '700',
            marginLeft: tokens.spacing.xs,
            lineHeight: 16,
        },
        tableHeaderRow: {
            flexDirection: 'row',
            marginBottom: tokens.spacing.xs,
            borderRadius: 16,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: '#2D3C52',
            backgroundColor: '#0D1520',
        },
        tableCard: {
            borderRadius: 24,
            borderColor: '#C7D0DB22',
            backgroundColor: '#080B10',
            paddingTop: tokens.spacing.lg,
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
            paddingHorizontal: tokens.spacing.md,
        },
        headerPressable: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        colHeader: {
            color: '#8FA1B6',
            fontSize: 12,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 0.9,
        },
        sortIndicator: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '800',
            marginLeft: tokens.spacing.xs,
        },
        dataRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 16,
            marginBottom: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: `${tokens.colors.border}33`,
        },
        dataRowAlt: {
            backgroundColor: '#0D121B',
        },
        tableListWrap: {
            width: '100%',
            borderRadius: 18,
            backgroundColor: '#05080D',
        },
        tableListContent: {
            paddingHorizontal: tokens.spacing.xs,
            paddingBottom: tokens.spacing.md,
        },
        tableListFooter: {
            height: tokens.spacing.xxl,
        },
        colValue: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            lineHeight: 21,
        },
        totalRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: tokens.spacing.md,
            borderRadius: 16,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.md,
            borderTopWidth: 1,
            borderTopColor: '#2D3C52',
            backgroundColor: '#101722',
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
        emptyStateWrap: {
            minHeight: 240,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: tokens.spacing.xl,
            paddingVertical: tokens.spacing.xl,
        },
        emptyStateTitle: {
            color: tokens.colors.textSecondary,
            fontSize: 18,
            fontWeight: '700',
            textAlign: 'center',
        },
        emptyStateSubtitle: {
            color: tokens.colors.textMuted,
            fontSize: 14,
            lineHeight: 21,
            marginTop: tokens.spacing.sm,
            maxWidth: 420,
            textAlign: 'center',
        },
    });

export default ReportViewer;
