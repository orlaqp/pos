/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('./single-item', () => ({
  SingleItem: ({
    item,
    isActive,
  }: {
    item: { title: string };
    isActive?: boolean;
  }) => {
    const { Text } = require('react-native');
    return <Text>{`${item.title}:${isActive ? 'active' : 'inactive'}`}</Text>;
  },
}));

jest.mock('@rneui/themed', () => {
  const { Pressable, Text, View } = require('react-native');
  const ListItem: any = {};
  ListItem.Accordion = ({
    content,
    onPress,
    children,
    isExpanded,
    containerStyle,
  }: {
    content: React.ReactNode;
    onPress: () => void;
    children: React.ReactNode;
    isExpanded: boolean;
    containerStyle?: unknown;
  }) => (
    <View>
      <Pressable testID="submenu-toggle" onPress={onPress} style={containerStyle}>
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
    const setExpandedId = jest.fn();
    const { getByTestId, getByText } = render(
      <Submenu
        item={parent}
        selectedId={null}
        setSelected={jest.fn()}
        expandedId="i"
        setExpandedId={setExpandedId}
      />
    );

    expect(getByTestId('submenu-children')).toBeTruthy();
    expect(getByText('In Stock:inactive')).toBeTruthy();

    fireEvent.press(getByTestId('submenu-toggle'));
    expect(setExpandedId).toHaveBeenCalledWith(undefined);
  });

  it('expands when currently collapsed', () => {
    const setExpandedId = jest.fn();
    const { getByTestId } = render(
      <Submenu
        item={parent}
        selectedId={null}
        setSelected={jest.fn()}
        expandedId={undefined}
        setExpandedId={setExpandedId}
      />
    );

    fireEvent.press(getByTestId('submenu-toggle'));
    expect(setExpandedId).toHaveBeenCalledWith('i');
  });

  it('highlights parent state when a child is selected', () => {
    const { getByText } = render(
      <Submenu
        item={parent}
        selectedId="i-1"
        setSelected={jest.fn()}
        expandedId="i"
        setExpandedId={jest.fn()}
      />
    );

    expect(getByText('In Stock:active')).toBeTruthy();
  });
});
