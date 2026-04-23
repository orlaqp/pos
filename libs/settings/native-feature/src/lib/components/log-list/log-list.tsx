import { selectAllEvents } from '@pos/shared/data-store';
import { UICard, UIStack, UIScreen } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React from 'react';

import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface LogListProps {}

export const formatLogTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Unknown time';

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;

    return date.toLocaleString();
};

export const formatLogPayload = (payload?: string) => {
    if (!payload) return 'No details recorded.';

    try {
        return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
        return payload;
    }
};

export const getLogCategory = (event?: string) =>
    event?.split(/[:.\s]/)[0]?.trim() || 'Event';

export function LogList(_props: LogListProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const events = useSelector(selectAllEvents);

    return (
        <UIScreen padded>
            <UIStack spacing="lg">
                <UICard tone="muted" radius="lg">
                    <View style={styles.headerRow}>
                        <View style={styles.headerTextWrap}>
                            <Text style={styles.title}>System Logs</Text>
                            <Text style={styles.subtitle}>
                                Track sync and device events for
                                troubleshooting.
                            </Text>
                        </View>
                        <View style={styles.countBadge}>
                            <Text style={styles.countValue}>
                                {events?.length || 0}
                            </Text>
                            <Text style={styles.countLabel}>Events</Text>
                        </View>
                    </View>
                </UICard>

                {(!events || events.length === 0) && (
                    <UICard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No logs available.</Text>
                    </UICard>
                )}

                {!!events?.length && (
                    <FlatList
                        data={events}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={(item, index) =>
                            `${item.id || item.timestamp || 'event'}-${index}`
                        }
                        renderItem={(info) => (
                            <UICard style={styles.logCard}>
                                <View style={styles.logHeader}>
                                    <View style={styles.headerTextWrap}>
                                        <View style={styles.eventTitleRow}>
                                            <Text style={styles.eventName}>
                                                {info.item.event}
                                            </Text>
                                            <View style={styles.categoryBadge}>
                                                <Text
                                                    style={styles.categoryText}
                                                >
                                                    {getLogCategory(
                                                        info.item.event,
                                                    )}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.timestamp}>
                                            {formatLogTimestamp(
                                                info.item.timestamp,
                                            )}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.payloadPanel}>
                                    <Text style={styles.payload}>
                                        {formatLogPayload(info.item.data)}
                                    </Text>
                                </View>
                            </UICard>
                        )}
                    />
                )}
            </UIStack>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        headerRow: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        headerTextWrap: {
            flex: 1,
            paddingRight: tokens.spacing.md,
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '700',
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
        },
        countBadge: {
            alignItems: 'center',
            borderColor: `${tokens.colors.accent}55`,
            borderRadius: 999,
            borderWidth: 1,
            backgroundColor: `${tokens.colors.accent}14`,
            minWidth: 86,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
        },
        countValue: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
        },
        countLabel: {
            color: tokens.colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
        },
        emptyCard: {
            minHeight: 180,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            color: tokens.colors.textSecondary,
            textAlign: 'center',
            paddingVertical: tokens.spacing.sm,
        },
        listContent: {
            paddingBottom: tokens.spacing.lg,
        },
        logCard: {
            marginBottom: tokens.spacing.sm,
        },
        logHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        eventTitleRow: {
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.sm,
        },
        categoryBadge: {
            borderColor: `${tokens.colors.accent}55`,
            borderRadius: 999,
            borderWidth: 1,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xxs,
        },
        categoryText: {
            color: tokens.colors.accent,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.7,
            textTransform: 'uppercase',
        },
        eventName: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
        timestamp: {
            color: tokens.colors.textMuted,
            marginTop: tokens.spacing.xxs,
            fontSize: 13,
        },
        payloadPanel: {
            borderColor: tokens.colors.border,
            borderRadius: 14,
            borderWidth: 1,
            backgroundColor: tokens.colors.surfaceAccent,
            marginTop: tokens.spacing.md,
            padding: tokens.spacing.md,
        },
        payload: {
            color: tokens.colors.textSecondary,
            fontFamily: 'Courier',
            fontSize: 13,
            lineHeight: 19,
        },
    });

export default LogList;
