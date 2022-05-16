import React from 'react';

import { Input, useTheme } from '@rneui/themed';
export interface UiSearchInputProps {
    value?: string;
    onChange: (query: string) => unknown;
}

export function UISearchInput({ onChange, value }: UiSearchInputProps) {
    const theme = useTheme();
  return (
    <Input
      placeholder="type to search ..."
      value={value}
      onChangeText={onChange}
      containerStyle={{
        backgroundColor: theme.theme.colors.grey5,
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
