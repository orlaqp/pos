import { CategoryForm } from '@pos/categories/native-feature';
import React from 'react';

import { View, Text } from 'react-native';

/* eslint-disable-next-line */
export interface BackOfficeProps {}

export function BackOffice(props: BackOfficeProps) {
  return (
    <View>
      <Text>Welcome to back-office!</Text>
      <CategoryForm />
    </View>
  );
}

export default BackOffice;
