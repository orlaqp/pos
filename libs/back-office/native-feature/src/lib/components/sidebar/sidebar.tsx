import React from 'react';
import { ListItem } from '@rneui/themed';
import { useState } from 'react';

import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
// import Ant from 'react-native-vector-icons/AntDesign';

const list = [
  {
    title: 'Dashboard',
    icon: 'monitor-dashboard',
  },
  {
    title: 'Reports',
    icon: 'bar-chart',
    children: []
  },
  {
    title: 'Inventory',
    icon: 'inventory',
    children: []
  },
  {
    title: 'Products',
    icon: 'barcode',
    children: []
  },
  {
    title: 'Users',
    icon: 'av-timer',
    children: []
  },
  {
    title: 'Customers',
    icon: 'av-timer',
    children: []
  },
  {
    title: 'Location & Devices',
    icon: 'av-timer',
    children: []
  },
  {
    title: 'Settings',
    icon: 'flight-takeoff',
  },
];

function SidebarItem(props) {}

/* eslint-disable-next-line */
export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      {list.map((item, i) => (
        <ListItem key={i}>
          <Icon name={item.icon} />
          <ListItem.Content>
            <ListItem.Title>{item.title}</ListItem.Title>
          </ListItem.Content>
          {/* <ListItem.Chevron /> */}
        </ListItem>
      ))}
      <ListItem.Accordion
        content={
          <>
            <Icon name="place" size={30} />
            <ListItem.Content>
              <ListItem.Title>List Accordion</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded}
        onPress={() => {
          setExpanded(!expanded);
        }}
      >
        <ListItem key={1} bottomDivider>
          <ListItem.Content>
            <ListItem.Title>{'Title'}</ListItem.Title>
            <ListItem.Subtitle>{'Subtitle'}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </ListItem.Accordion>
    </View>
  );
}

export default Sidebar;
