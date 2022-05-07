import React from 'react';
import { Icon, ListItem, useTheme } from '@rneui/themed';
import { useState } from 'react';

import { View, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { SidebarItem } from './definitions';
import { Submenu } from './submenu';
import { SingleItem } from './single-item';

const list: SidebarItem[] = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'view-dashboard-outline',
  },
  {
    id: '2',
    title: 'Customers',
    icon: 'account-box-multiple-outline'
  },
  {
    id: '3',
    title: 'Reports',
    icon: 'clipboard-list-outline',
    children: [],
  },
  {
    id: '4',
    title: 'Inventory',
    icon: 'warehouse',
    children: [
        {
            id: '4-1',
            title: 'Receive',
        },
        {
            id: '4-2',
            title: 'Count',
        },
    ],
  },
  {
    id: '5',
    title: 'Products',
    icon: 'qrcode',
    children: [
        { id: '5-1', title: 'Categories' },
        { id: '5-2', title: 'Products' },
    ],
  },
  {
    id: '6',
    title: 'Users',
    icon: 'account-group-outline',
    children: [
        { id: '6-1', title: 'Users' },
        { id: '6-2', title: 'Roles' },
    ],
  },
  {
    id: '7',
    title: 'Settings',
    icon: 'cog-outline',
    children: [
        { id: '7-1', title: 'Store Info' },
        { id: '7-2', title: 'Printers' },
        { id: '7-3', title: 'Receipt' },
    ],
  },
];


/* eslint-disable-next-line */
export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
  const styles = useStyles();
  const [expanded, setExpanded] = useState<SidebarItem | null>(null);
  const [selected, setSelected] = useState<SidebarItem | null>(null);
  
  return (
    <View>
      {list.map((item, i) => {
        if (!item.children)
          return <SingleItem key={item.id} fileKey={item.id} item={item} selected={selected} setSelected={setSelected} />;
        else
          return <Submenu
            key={item.id}
            fileKey={item.id}
            item={item}
            selected={selected}
            setSelected={setSelected}
            expanded={expanded}
            setExpanded={setExpanded}
        />
      })}
    </View>
  );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            item: {
                color: theme.theme.colors.grey1
            }
        })
    }
}

export default Sidebar;
