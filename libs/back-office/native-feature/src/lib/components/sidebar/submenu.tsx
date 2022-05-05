import React from 'react';
import { Icon, ListItem, useTheme } from '@rneui/themed';
import { SidebarItem } from './definitions';
import { SingleItem, SingleItemProps } from './single-item';
import { View } from 'react-native';

export interface SubmenuProps extends SingleItemProps {
  expanded: SidebarItem | null;
  setExpanded: (item: SidebarItem) => void;
}

export function Submenu({
  item,
  selected,
  setSelected,
  expanded,
  setExpanded,
}: SubmenuProps) {
  const theme = useTheme();
  return (
    <ListItem.Accordion
      content={
        <>
          {item.icon && <Icon name={item.icon} type="material-community" color={theme.theme.colors.grey3} />}
          <ListItem.Content style={{ marginLeft: 20 }}>
            <ListItem.Title
              style={{
                color: theme.theme.colors.grey1,
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
      onPress={() => setExpanded(item)}
    >
      <View style={{ marginLeft: 20 }}>
        {item.children?.map((c, idx) => (
          <SingleItem chevron item={c} selected={selected} setSelected={setSelected} />
        ))}
      </View>
    </ListItem.Accordion>
  );
}
