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
            content={
                <View style={styles.headerContent}>
                    {item.icon && (
                        <View key={`sidebar-submenu-icon-${item.id}`} style={styles.iconSlot}>
                            <Icon
                                name={item.icon}
                                type="material-community"
                                size={20}
                                color={
                                    parentActive
                                        ? colors.primary
                                        : colors.grey3
                                }
                            />
                        </View>
                    )}
                    <ListItem.Content
                        key={`sidebar-submenu-content-${item.id}`}
                        style={styles.headerTitleContent}
                    >
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
            }
            isExpanded={isExpanded}
            onPress={() => setExpandedId(isExpanded ? undefined : item.id)}
        >
            <View key={`sidebar-submenu-children-${item.id}`} style={styles.childrenContainer}>
                <View key={`sidebar-submenu-rail-${item.id}`} style={styles.childrenRail} />
                <View key={`sidebar-submenu-items-${item.id}`} style={styles.childrenItems}>
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
            borderRadius: 10,
            borderLeftWidth: 3,
            borderLeftColor: 'transparent',
            paddingHorizontal: 10,
            minHeight: 52,
            marginBottom: 6,
        },
        accordionContainerActive: {
            backgroundColor: `${colors.primary}22`,
            borderLeftColor: colors.primary,
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconSlot: {
            width: 26,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitleContent: {
            marginLeft: 6,
        },
        headerTitle: {
            color: colors.grey1,
            fontWeight: '500',
            fontSize: 17,
        },
        headerTitleActive: {
            color: colors.primary,
            fontWeight: '700',
        },
        childrenContainer: {
            flexDirection: 'row',
            marginTop: 4,
            marginLeft: 12,
            marginBottom: 2,
        },
        childrenRail: {
            width: 1,
            backgroundColor: `${colors.grey4}99`,
            marginRight: 10,
            marginLeft: 3,
        },
        childrenItems: {
            flex: 1,
        },
    });
