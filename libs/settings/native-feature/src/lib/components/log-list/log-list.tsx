import { selectAllEvents } from '@pos/shared/data-store';
import { UICard, UIStack, UIScreen } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React from 'react';

import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface LogListProps {}

export function LogList(props: LogListProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const events = useSelector(selectAllEvents);
    
    return (
        <UIScreen padded>
            <UIStack spacing="lg">
                <UICard tone="muted" radius="lg">
                    <Text style={styles.title}>System Logs</Text>
                    <Text style={styles.subtitle}>
                        Track sync and device events for troubleshooting.
                    </Text>
                </UICard>

                {(!events || events.length === 0) && (
                    <UICard>
                        <Text style={styles.emptyText}>No logs available.</Text>
                    </UICard>
                )}

                {!!events?.length && (
                    <FlatList
                        data={events}
                        keyExtractor={(item, index) =>
                            `${item.id || item.timestamp || 'event'}-${index}`
                        }
                        renderItem={(info) => (
                            <View style={styles.logCardWrap}>
                                <UICard>
                                    <View style={styles.logRow}>
                                        <View style={styles.leftCol}>
                                            <Text style={styles.eventName}>
                                                {info.item.event}
                                            </Text>
                                            <Text style={styles.timestamp}>
                                                {info.item.timestamp}
                                            </Text>
                                        </View>
                                        <View style={styles.rightCol}>
                                            <Text style={styles.payload}>
                                                {info.item.data}
                                            </Text>
                                        </View>
                                    </View>
                                </UICard>
                            </View>
                        )}
                    />
                )}
            </UIStack>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
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
        emptyText: {
            color: tokens.colors.textSecondary,
            textAlign: 'center',
            paddingVertical: tokens.spacing.sm,
        },
        logCardWrap: {
            marginBottom: tokens.spacing.sm,
        },
        logRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        leftCol: {
            flex: 2,
            paddingRight: tokens.spacing.md,
        },
        rightCol: {
            flex: 4,
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
        payload: {
            color: tokens.colors.textSecondary,
            lineHeight: 20,
        },
    });

export default LogList;
