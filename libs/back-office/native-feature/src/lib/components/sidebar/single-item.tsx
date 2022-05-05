import React from 'react';
import { Icon, ListItem, useTheme } from '@rneui/themed';
import { SidebarItem } from './definitions';

export interface SingleItemProps {
    chevron?: boolean;
    item: SidebarItem;
    selected: SidebarItem | null;
    setSelected: (item: SidebarItem) => void;
}

export function SingleItem({ chevron, item , selected, setSelected}: SingleItemProps) {
    const theme = useTheme();
    return <ListItem key={item.id} onPress={() => setSelected(item)}>
        { item.icon && 
        <Icon name={item.icon} type="material-community" />
        }
        <ListItem.Content>
        <ListItem.Title style={[
            {
                color: theme.theme.colors.grey1,
                backgroundColor: item === selected ? theme.theme.colors.primary : 'transparent'
            }
        ]}>{item.title}</ListItem.Title>
        </ListItem.Content>
        { chevron && <ListItem.Chevron />}
    </ListItem>
}
