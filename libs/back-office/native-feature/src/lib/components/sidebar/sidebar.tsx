import React from 'react';

import { View, Text } from 'react-native';

/* eslint-disable-next-line */
export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
  return (
    <View>
      <Text style={{color: 'white'}}>Welcome to sidebar!</Text>
    </View>
  );
}

export default Sidebar;
