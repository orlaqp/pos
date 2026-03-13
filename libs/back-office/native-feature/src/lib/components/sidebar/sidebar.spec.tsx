/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

const menu = [
  { id: '1', title: 'Dashboard', icon: 'i' },
  {
    id: '2',
    title: 'Products',
    icon: 'p',
    children: [{ id: '2-1', title: 'List' }],
  },
];

jest.mock('./menu-items', () => ({ menuItems: menu }));

jest.mock('./single-item', () => ({
  SingleItem: ({ item, setSelected }: { item: { title: string }; setSelected: (item: { title: string }) => void }) => (
    <Pressable testID={`single-${item.title}`} onPress={() => setSelected(item)}>
      <Text>{item.title}</Text>
    </Pressable>
  ),
}));

jest.mock('./submenu', () => ({
  Submenu: ({ item }: { item: { title: string } }) => (
    <Text testID={`submenu-${item.title}`}>{item.title}</Text>
  ),
}));

const { Sidebar } = require('./sidebar');

describe('Sidebar', () => {
  it('renders single items and submenus from menu configuration', () => {
    const navigation = { replace: jest.fn() };
    const { getByTestId } = render(<Sidebar navigation={navigation} />);

    expect(getByTestId('single-Dashboard')).toBeTruthy();
    expect(getByTestId('submenu-Products')).toBeTruthy();
  });

  it('navigates when selecting an item and ignores selecting same item twice', () => {
    const navigation = { replace: jest.fn() };
    const { getByTestId } = render(<Sidebar navigation={navigation} />);

    fireEvent.press(getByTestId('single-Dashboard'));
    fireEvent.press(getByTestId('single-Dashboard'));

    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith('Dashboard', undefined);
  });
});
