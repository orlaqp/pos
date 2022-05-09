import React from 'react';

import { Input, useTheme } from '@rneui/themed';
export interface UiSearchInputProps {
    onChange: (query: string) => unknown;
}

export function UISearchInput({ onChange }: UiSearchInputProps) {
    const theme = useTheme();
  return (
    <Input
      placeholder="type to search ..."
      onChangeText={onChange}
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
