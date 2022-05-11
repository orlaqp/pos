import React from 'react';

import { Icon, ListItem, useTheme } from '@rneui/themed';
import { SidebarItem } from './definitions';
import { SingleItem, SingleItemProps } from './single-item';
import { View } from 'react-native';

export interface SubmenuProps extends SingleItemProps {
    expanded: SidebarItem | null | undefined;
    setExpanded: (item?: SidebarItem | null | undefined) => void;
}

export function Submenu({
    item,
    selected,
    setSelected,
    expanded,
    setExpanded,
}: SubmenuProps) {
    const theme = useTheme();
    // const toggle = (sidebar) => setExpanded(expanded === item ? null : item);

    return (
        <ListItem.Accordion
            content={
                <>
                    {item.icon && (
                        <Icon
                            name={item.icon}
                            type="material-community"
                            color={selected && item.children?.includes(selected) ? theme.theme.colors.grey0 : theme.theme.colors.grey3}
                        />
                    )}
                    <ListItem.Content style={{ marginLeft: 20 }}>
                        <ListItem.Title
                            style={{
                                color: theme.theme.colors.grey1,
                                fontWeight: selected && item.children?.includes(selected) ? 'bold' : 'normal',
                                backgroundColor:
                                    item === selected
                                        ? theme.theme.colors.primary
                                        : 'transparent',
                            }}
                        >
                            {item.title}
                        </ListItem.Title>
                    </ListItem.Content>
                </>
            }
            isExpanded={expanded === item}
            onPress={() => setExpanded(expanded === item ? undefined : item)}
        >
            <View style={{ marginLeft: 20 }}>
                {item.children?.map((c, idx) => (
                    <SingleItem
                        key={c.id}
                        chevron
                        item={c}
                        selected={selected}
                        setSelected={setSelected}
                    />
                ))}
            </View>
        </ListItem.Accordion>
    );
}
