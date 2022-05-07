import { Input, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';

/* eslint-disable-next-line */
export interface UiSearchInputProps {}

export function UISearchInput(props: UiSearchInputProps) {
    const theme = useTheme();
  return (
    <Input
      placeholder="type to search ..."
      containerStyle={{
        backgroundColor: theme.theme.colors.searchBg,
        borderRadius: 20,
      }}
      inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 10 }}
      inputStyle={{ color: theme.theme.colors.grey1 }}
      rightIcon={{
        name: 'magnify',
        type: 'material-community',
        color: theme.theme.colors.grey2,
      }}
      renderErrorMessage={false}
    />
  );
}

export default UISearchInput;
