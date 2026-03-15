/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@rneui/themed', () => {
  const { Pressable, Text, View } = require('react-native');
  const ListItem = ({
    children,
    onPress,
    containerStyle,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    containerStyle?: unknown;
  }) => (
    <Pressable testID="single-item-press" onPress={onPress} style={containerStyle}>
      {children}
    </Pressable>
  );

  ListItem.Content = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
  ListItem.Title = ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>;
  return {
    useTheme: () => ({
      theme: { colors: { grey0: '#fff', grey1: '#eee', grey3: '#ccc', grey5: '#999', primary: '#00f' } },
    }),
    Icon: ({ name }: { name: string }) => <Text testID={`icon-${name}`}>{name}</Text>,
    ListItem,
  };
});

const { SingleItem } = require('./single-item');

describe('SingleItem', () => {
  const item = { id: '1', title: 'Dashboard', icon: 'view-dashboard-outline' };

  it('calls setSelected when item is not selected', () => {
    const setSelected = jest.fn();
    const { getByTestId } = render(
      <SingleItem item={item} selectedId={null} setSelected={setSelected} />
    );

    fireEvent.press(getByTestId('single-item-press'));
    expect(setSelected).toHaveBeenCalledWith(item);
  });

  it('does not call setSelected when item is already selected', () => {
    const setSelected = jest.fn();
    const { getByTestId } = render(
      <SingleItem item={item} selectedId="1" setSelected={setSelected} />
    );

    fireEvent.press(getByTestId('single-item-press'));
    expect(setSelected).not.toHaveBeenCalled();
  });

  it('renders chevron when requested', () => {
    const { getByTestId } = render(
      <SingleItem item={item} selectedId={null} setSelected={jest.fn()} chevron />
    );

    expect(getByTestId('icon-chevron-right')).toBeTruthy();
  });

  it('applies different container styles for active/inactive states', () => {
    const { getByTestId, rerender } = render(
      <SingleItem item={item} selectedId={null} setSelected={jest.fn()} />
    );
    const inactiveStyle = getByTestId('single-item-press').props.style;

    rerender(<SingleItem item={item} selectedId="1" setSelected={jest.fn()} />);
    const activeStyle = getByTestId('single-item-press').props.style;

    expect(inactiveStyle).not.toEqual(activeStyle);
  });
});
