import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, ListItem, useTheme } from '@rneui/themed';
import { SingleItem, SingleItemProps } from './single-item';
import i18next from 'i18next';
import { getThemeColors } from '@pos/theme/native';

export interface SubmenuProps extends SingleItemProps {
    expandedId?: string;
    setExpandedId: (itemId?: string) => void;
}

export function Submenu({
    item,
    selectedId,
    setSelected,
    expandedId,
    setExpandedId,
}: SubmenuProps) {
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const styles = useStyles(colors);
    const hasActiveChild = !!item.children?.some((c) => c.id === selectedId);
    const isExpanded = expandedId === item.id;
    const parentActive = hasActiveChild || selectedId === item.id;
    const title =
        item.labelKey && i18next.isInitialized && i18next.exists(item.labelKey)
            ? i18next.t(item.labelKey)
            : item.title;
    const headerContent = (
        <View style={styles.headerContent}>
            {item.icon ? (
                <View style={styles.iconSlot}>
                    <Icon
                        name={item.icon}
                        type="material-community"
                        size={20}
                        color={parentActive ? colors.primary : colors.grey3}
                    />
                </View>
            ) : null}
            <ListItem.Content style={styles.headerTitleContent}>
                <ListItem.Title
                    style={[
                        styles.headerTitle,
                        parentActive && styles.headerTitleActive,
                    ]}
                >
                    {title}
                </ListItem.Title>
            </ListItem.Content>
        </View>
    );

    return (
        <ListItem.Accordion
            containerStyle={[
                styles.accordionContainer,
                parentActive ? styles.accordionContainerActive : undefined,
            ]}
            icon={
                <Icon
                    name="chevron-down"
                    type="material-community"
                    size={18}
                    color={parentActive ? colors.primary : colors.grey4}
                />
            }
            expandIcon={
                <Icon
                    name="chevron-down"
                    type="material-community"
                    size={18}
                    color={parentActive ? colors.primary : colors.grey4}
                />
            }
            content={headerContent}
            isExpanded={isExpanded}
            onPress={() => setExpandedId(isExpanded ? undefined : item.id)}
        >
            <View style={styles.childrenContainer}>
                <View style={styles.childrenRail} />
                <View style={styles.childrenItems}>
                    {item.children?.map((c) => (
                        <SingleItem
                            key={c.id}
                            chevron
                            compact
                            item={c}
                            selectedId={selectedId}
                            isActive={selectedId === c.id}
                            setSelected={setSelected}
                        />
                    ))}
                </View>
            </View>
        </ListItem.Accordion>
    );
}

const useStyles = (colors: ReturnType<typeof getThemeColors>) =>
    StyleSheet.create({
        accordionContainer: {
            borderRadius: 18,
            borderWidth: 1,
            borderColor: `${colors.grey4}22`,
            backgroundColor: '#0E141C',
            paddingHorizontal: 14,
            minHeight: 58,
            marginBottom: 8,
        },
        accordionContainerActive: {
            backgroundColor: `${colors.primary}18`,
            borderColor: `${colors.primary}66`,
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconSlot: {
            width: 28,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitleContent: {
            marginLeft: 8,
        },
        headerTitle: {
            color: colors.grey1,
            fontWeight: '600',
            fontSize: 16,
        },
        headerTitleActive: {
            color: colors.primary,
            fontWeight: '800',
        },
        childrenContainer: {
            flexDirection: 'row',
            marginTop: 8,
            marginLeft: 16,
            marginBottom: 4,
        },
        childrenRail: {
            width: 1,
            backgroundColor: `${colors.primary}40`,
            marginRight: 12,
            marginLeft: 3,
        },
        childrenItems: {
            flex: 1,
        },
    });
