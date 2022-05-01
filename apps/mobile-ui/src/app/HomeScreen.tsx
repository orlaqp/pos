import { useTheme, Button } from '@rneui/themed';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export const HomeScreen = () => {
  
  return (
    <View>
        <Text>Home 4</Text>
      <Button title="My button" />
    </View>
  );
};

// const useStyles = () => {
//   const myTheme = useTheme();

//   return StyleSheet.create({
//     appContainer: {
//       flex: 1,
//       backgroundColor: myTheme.theme.colors.background,
//     },
//   });
// };
