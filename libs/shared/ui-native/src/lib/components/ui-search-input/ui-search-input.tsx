import React from 'react';

import { Input, useTheme } from '@rneui/themed';
import { TextInput } from 'react-native';
type UiSearchInputProps = React.ComponentProps<typeof TextInput> & {
    // value?: string;
    // onChange: (query: string) => unknown;
}

export const UISearchInput = React.forwardRef<TextInput, UiSearchInputProps>((props, ref) => {
    const theme = useTheme();
    const {value, onChange, ...restOfProps} = props;
  return (
    <Input
      {...restOfProps}
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
});

// export function UISearchInput2({ onChange, value }: UiSearchInputProps) {
//     const theme = useTheme();
//   return (
//     <Input
//       placeholder="type to search ..."
//       showSoftInputOnFocus={false}
//       value={value}
//       onChangeText={onChange}
//       containerStyle={{
//         backgroundColor: theme.theme.colors.grey5,
//         borderRadius: 20,
//       }}
//       inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 10 }}
//       inputStyle={{ color: theme.theme.colors.grey1 }}
//       rightIcon={{
//         name: 'magnify',
//         type: 'material-community',
//         color: theme.theme.colors.grey2,
//       }}
//       renderErrorMessage={false}
//     />
//   );
// }

// export default UISearchInput;
