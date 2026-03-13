/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

jest.mock('./single-item', () => ({
  SingleItem: ({ item }: { item: { title: string } }) => <Text>{item.title}</Text>,
}));

jest.mock('@rneui/themed', () => {
  const ListItem: any = {};
  ListItem.Accordion = ({ content, onPress, children, isExpanded }: { content: React.ReactNode; onPress: () => void; children: React.ReactNode; isExpanded: boolean }) => (
    <View>
      <Pressable testID="submenu-toggle" onPress={onPress}>
        {content}
      </Pressable>
      {isExpanded ? <View testID="submenu-children">{children}</View> : null}
    </View>
  );
  ListItem.Content = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
  ListItem.Title = ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>;

  return {
    useTheme: () => ({
      theme: { colors: { grey0: '#fff', grey1: '#eee', grey3: '#ccc', primary: '#00f' } },
    }),
    Icon: ({ name }: { name: string }) => <Text>{name}</Text>,
    ListItem,
  };
});

const { Submenu } = require('./submenu');

describe('Submenu', () => {
  const parent = {
    id: 'i',
    title: 'Inventory',
    icon: 'warehouse',
    children: [
      { id: 'i-1', title: 'In Stock' },
      { id: 'i-2', title: 'Counts' },
    ],
  };

  it('renders children when expanded and toggles collapse', () => {
    const setExpanded = jest.fn();
    const { getByTestId, getByText } = render(
      <Submenu
        key="i"
        item={parent}
        selected={null}
        setSelected={jest.fn()}
        expanded={parent}
        setExpanded={setExpanded}
      />
    );

    expect(getByTestId('submenu-children')).toBeTruthy();
    expect(getByText('In Stock')).toBeTruthy();

    fireEvent.press(getByTestId('submenu-toggle'));
    expect(setExpanded).toHaveBeenCalledWith(undefined);
  });

  it('expands when currently collapsed', () => {
    const setExpanded = jest.fn();
    const { getByTestId } = render(
      <Submenu
        key="i"
        item={parent}
        selected={null}
        setSelected={jest.fn()}
        expanded={undefined}
        setExpanded={setExpanded}
      />
    );

    fireEvent.press(getByTestId('submenu-toggle'));
    expect(setExpanded).toHaveBeenCalledWith(parent);
  });
});
