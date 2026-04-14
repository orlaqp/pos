import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, ListItem, useTheme } from '@rneui/themed';
import { SidebarItem } from './definitions';
import i18next from 'i18next';
import { getThemeColors } from '@pos/theme/native';

export interface SingleItemProps {
    chevron?: boolean;
    compact?: boolean;
    item: SidebarItem;
    selectedId: string | null;
    isActive?: boolean;
    setSelected: (item: SidebarItem) => void;
}

export function SingleItem({
    chevron,
    compact,
    item,
    selectedId,
    isActive,
    setSelected,
}: SingleItemProps) {
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const styles = useStyles(colors);
    const active = isActive ?? selectedId === item.id;
    const title =
        item.labelKey && i18next.isInitialized && i18next.exists(item.labelKey)
            ? i18next.t(item.labelKey)
            : item.title;
    return (
        <ListItem
            testID={`sidebar-item-${item.id}`}
            onPress={() => selectedId !== item.id && setSelected(item)}
            containerStyle={[
                styles.containerBase,
                compact ? styles.containerCompact : styles.containerRegular,
                active ? styles.containerActive : styles.containerInactive,
            ]}
        >
            {item.icon ? (
                <View style={styles.iconSlot}>
                    <Icon
                        name={item.icon}
                        type="material-community"
                        size={compact ? 17 : 20}
                        color={active ? colors.primary : colors.grey3}
                    />
                </View>
            ) : null}
            <ListItem.Content style={styles.content}>
                <ListItem.Title
                    style={[
                        styles.title,
                        compact && styles.titleCompact,
                        active && styles.titleActive,
                    ]}
                >
                    {title}
                </ListItem.Title>
            </ListItem.Content>
            {chevron ? (
                <Icon
                    name="chevron-right"
                    type="material-community"
                    size={18}
                    color={active ? colors.primary : colors.grey4}
                />
            ) : null}
        </ListItem>
    );
}

const useStyles = (colors: ReturnType<typeof getThemeColors>) =>
    StyleSheet.create({
        containerBase: {
            borderRadius: 10,
            borderLeftWidth: 3,
            marginBottom: 6,
        },
        containerRegular: {
            minHeight: 52,
            paddingHorizontal: 10,
            paddingVertical: 8,
        },
        containerCompact: {
            minHeight: 42,
            paddingHorizontal: 10,
            paddingVertical: 5,
        },
        containerActive: {
            backgroundColor: `${colors.primary}22`,
            borderLeftColor: colors.primary,
        },
        containerInactive: {
            backgroundColor: 'transparent',
            borderLeftColor: 'transparent',
        },
        iconSlot: {
            width: 26,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 6,
        },
        content: {
            marginLeft: 0,
        },
        title: {
            color: colors.grey1,
            fontWeight: '500',
            fontSize: 17,
        },
        titleCompact: {
            fontSize: 15,
            color: colors.grey2,
            fontWeight: '500',
        },
        titleActive: {
            color: colors.primary,
            fontWeight: '700',
        },
    });
