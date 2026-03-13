/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const menu = [
  { id: '1', title: 'Dashboard', icon: 'i', group: 'Core' },
  { id: '3', title: 'Reports', icon: 'r', group: 'Core' },
  {
    id: '2',
    title: 'Products',
    icon: 'p',
    group: 'Management',
    children: [{ id: '2-1', title: 'List' }],
  },
];

jest.mock('./menu-items', () => ({ menuItems: menu }));

jest.mock('@rneui/themed', () => ({
  useTheme: () => ({
    theme: { colors: { grey3: '#9aa3b2' } },
  }),
}));

jest.mock('./single-item', () => ({
  SingleItem: ({ item, setSelected }: { item: { title: string }; setSelected: (item: { title: string }) => void }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID={`single-${item.title}`} onPress={() => setSelected(item)}>
        <Text>{item.title}</Text>
      </Pressable>
    );
  },
}));

jest.mock('./submenu', () => ({
  Submenu: ({ item }: { item: { title: string } }) => {
    const { Text } = require('react-native');
    return <Text testID={`submenu-${item.title}`}>{item.title}</Text>;
  },
}));

const { Sidebar } = require('./sidebar');

describe('Sidebar', () => {
  it('renders section labels, single items and submenus from menu configuration', () => {
    const navigation = { replace: jest.fn() };
    const { getByTestId, getByText } = render(<Sidebar navigation={navigation} />);

    expect(getByTestId('single-Dashboard')).toBeTruthy();
    expect(getByTestId('submenu-Products')).toBeTruthy();
    expect(getByText('Core')).toBeTruthy();
    expect(getByText('Management')).toBeTruthy();
  });

  it('navigates when selecting an item and ignores selecting same item twice', () => {
    const navigation = { replace: jest.fn() };
    const { getByTestId } = render(<Sidebar navigation={navigation} />);

    fireEvent.press(getByTestId('single-Reports'));
    fireEvent.press(getByTestId('single-Reports'));

    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith('Reports', undefined);
  });
});
