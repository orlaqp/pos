import React from 'react';
import { Icon, ListItem } from '@rneui/themed';
import { useState } from 'react';

import { View } from 'react-native';

const list = [
  {
    title: 'Dashboard',
    icon: 'view-dashboard-outline',
  },
  {
    title: 'Customers',
    icon: 'account-box-multiple-outline'
  },
  {
    title: 'Reports',
    icon: 'clipboard-list-outline',
    children: [],
  },
  {
    title: 'Inventory',
    icon: 'warehouse',
    children: [
        {
            title: 'Receive ',
            icon: 'warehouse'
        },
        {
            title: 'Count',
            icon: 'warehouse'
        },
    ],
  },
  {
    title: 'Products',
    icon: 'qrcode',
    children: [],
  },
  {
    title: 'Users',
    icon: 'account-group-outline',
    children: [],
  },
  {
    title: 'Settings',
    icon: 'cog-outline',
    children: [],
  },
];

function SidebarItem(props) {}

/* eslint-disable-next-line */
export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      {list.map((item, i) => {
        if (!item.children)
          return (
            <ListItem key={i}>
              <Icon name={item.icon} type="material-community" />
              <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          );
        else
          return (
            <ListItem.Accordion
              content={
                <>
                  <Icon name={item.icon} type="material-community" />
                  <ListItem.Content style={{ marginLeft: 20 }}>
                    <ListItem.Title>{item.title}</ListItem.Title>
                  </ListItem.Content>
                </>
              }
              isExpanded={expanded}
              onPress={() => {
                setExpanded(!expanded);
              }}
            >
              {item.children.map((c) => (
                <ListItem key={`${i}-${c}`} style={{marginLeft: 40}}>
                  <ListItem.Content>
                    <ListItem.Title>{c.title}</ListItem.Title>
                    {/* <ListItem.Subtitle>{'Subtitle'}</ListItem.Subtitle> */}
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </ListItem.Accordion>
          );
      })}
    </View>
  );
}

export default Sidebar;
