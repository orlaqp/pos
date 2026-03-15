import React, { useMemo, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';
import { SidebarGroup, SidebarItem } from './definitions';
import { Submenu } from './submenu';
import { SingleItem } from './single-item';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { menuItems } from './menu-items';
import { useTheme } from '@rneui/themed';
import i18next from 'i18next';
import { getThemeColors } from '@pos/theme/native';

export interface SidebarProps {
    navigation: NativeStackNavigationProp<any>;
}

export function Sidebar({ navigation }: SidebarProps) {
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const styles = useStyles(colors);
    const [expandedId, setExpandedId] = useState<string | undefined>(undefined);
    const [selectedId, setSelectedId] = useState<string | null>('1');

    const groupedItems = useMemo(() => {
        const groupOrder: SidebarGroup[] = ['Core', 'Management', 'Configuration'];
        return groupOrder.map((group) => ({
            group,
            items: menuItems.filter((item) => item.group === group),
        }));
    }, []);

    const getLabel = (key: string, fallback: string) => {
        if (!i18next.isInitialized || !i18next.exists(key)) return fallback;
        return i18next.t(key);
    };

    const getParentForItem = (item: SidebarItem) =>
        menuItems.find((parent) => parent.children?.some((child) => child.id === item.id));

    const onSelect = (item: SidebarItem) => {
        if (item.id === selectedId) return;

        const parent = getParentForItem(item);
        if (parent) {
            setExpandedId(parent.id);
        }

        setSelectedId(item.id);
        navigation.replace(item.title, item.params);
    };

    return (
        <View style={styles.container}>
            {groupedItems.map(({ group, items }) => {
                if (!items.length) return null;

                return (
                    <View key={group} style={styles.groupContainer}>
                        <Text style={styles.groupLabel}>
                            {getLabel(`SIDEBAR_GROUP_${group.toUpperCase()}`, group)}
                        </Text>
                        {items.map((item) => {
                            if (!item.children) {
                                return (
                                    <SingleItem
                                        key={item.id}
                                        item={item}
                                        selectedId={selectedId}
                                        setSelected={onSelect}
                                    />
                                );
                            }

                            return (
                                <Submenu
                                    key={item.id}
                                    item={item}
                                    selectedId={selectedId}
                                    setSelected={onSelect}
                                    expandedId={expandedId}
                                    setExpandedId={setExpandedId}
                                />
                            );
                        })}
                    </View>
                );
            })}
        </View>
    );
}

const useStyles = (colors: ReturnType<typeof getThemeColors>) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 6,
            paddingBottom: 12,
        },
        groupContainer: {
            marginBottom: 14,
        },
        groupLabel: {
            color: colors.grey3,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            paddingHorizontal: 14,
            marginBottom: 6,
        },
    });

export default Sidebar;
