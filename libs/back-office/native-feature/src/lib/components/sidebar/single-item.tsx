import React from 'react';
import { Icon, ListItem, useTheme } from '@rneui/themed';
import { SidebarItem } from './definitions';

export interface SingleItemProps {
    key: string;
    chevron?: boolean;
    item: SidebarItem;
    selected: SidebarItem | null;
    setSelected: (item: SidebarItem) => void;
}

export function SingleItem({
    chevron,
    item,
    selected,
    setSelected,
}: SingleItemProps) {
    const theme = useTheme();
    return (
        <ListItem
            fileKey={item.id}
            onPress={() => selected !== item && setSelected(item)}
        >
            {item.icon && (
                <Icon
                    name={item.icon}
                    type="material-community"
                    color={item === selected ? theme.theme.colors.grey0 : theme.theme.colors.grey3}
                />
            )}
            <ListItem.Content
                style={{
                    paddingLeft: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: item === selected ? theme.theme.colors.primary : 'transparent',

                }}
            >
                <ListItem.Title
                    style={[
                        {
                            color: item === selected ? theme.theme.colors.primary : theme.theme.colors.grey1,
                            fontWeight: item === selected ? 'bold' : 'normal'
                        },
                    ]}
                >
                    {item.title}
                </ListItem.Title>
            </ListItem.Content>
            {chevron && <ListItem.Chevron color={item === selected ? theme.theme.colors.primary : theme.theme.colors.grey5} />}
        </ListItem>
    );
}
