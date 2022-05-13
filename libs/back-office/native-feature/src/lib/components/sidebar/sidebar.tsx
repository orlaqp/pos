import React from 'react';
import { useState } from 'react';

import { View } from 'react-native';
import { SidebarItem } from './definitions';
import { Submenu } from './submenu';
import { SingleItem } from './single-item';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { menuItems } from './menu-items';

export interface SidebarProps {
    navigation: NativeStackNavigationProp<any>;
}

export function Sidebar({ navigation }: SidebarProps) {
    const [expanded, setExpanded] = useState<SidebarItem | null | undefined>(null);
    const [selected, setSelected] = useState<SidebarItem | null>(null);

    const onSelect = (item: SidebarItem) => {
        if (item === selected) return;

        setSelected(item);
        navigation.replace(item.title);
    }

    return (
        <View>
            {menuItems.map((item, i) => {
                if (!item.children)
                    return (
                        <SingleItem
                            key={item.id}
                            fileKey={item.id}
                            item={item}
                            selected={selected}
                            setSelected={onSelect}
                        />
                    );
                else
                    return (
                        <Submenu
                            key={item.id}
                            fileKey={item.id}
                            item={item}
                            selected={selected}
                            setSelected={onSelect}
                            expanded={expanded}
                            setExpanded={setExpanded}
                        />
                    );
            })}
        </View>
    );
}


export default Sidebar;
