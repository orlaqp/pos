/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

jest.mock('@rneui/themed', () => {
  const ListItem = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
    <Pressable testID="single-item-press" onPress={onPress}>
      {children}
    </Pressable>
  );

  ListItem.Content = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
  ListItem.Title = ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>;
  ListItem.Chevron = () => <Text testID="single-item-chevron">chevron</Text>;

  return {
    useTheme: () => ({
      theme: { colors: { grey0: '#fff', grey1: '#eee', grey3: '#ccc', grey5: '#999', primary: '#00f' } },
    }),
    Icon: ({ name }: { name: string }) => <Text>{name}</Text>,
    ListItem,
  };
});

const { SingleItem } = require('./single-item');

describe('SingleItem', () => {
  const item = { id: '1', title: 'Dashboard', icon: 'view-dashboard-outline' };

  it('calls setSelected when item is not selected', () => {
    const setSelected = jest.fn();
    const { getByTestId } = render(
      <SingleItem item={item} selected={null} setSelected={setSelected} key="1" />
    );

    fireEvent.press(getByTestId('single-item-press'));
    expect(setSelected).toHaveBeenCalledWith(item);
  });

  it('does not call setSelected when item is already selected', () => {
    const setSelected = jest.fn();
    const { getByTestId } = render(
      <SingleItem item={item} selected={item} setSelected={setSelected} key="1" />
    );

    fireEvent.press(getByTestId('single-item-press'));
    expect(setSelected).not.toHaveBeenCalled();
  });

  it('renders chevron when requested', () => {
    const { getByTestId } = render(
      <SingleItem item={item} selected={null} setSelected={jest.fn()} chevron key="1" />
    );

    expect(getByTestId('single-item-chevron')).toBeTruthy();
  });
});
