import { useTheme, Button } from '@rneui/themed';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export const HomeScreen = () => {
  const styles = useStyles();
  console.log('Running home screen');
  
  return (
    <View style={styles.appContainer}>
        <Text>Home</Text>
      <Button title="My button" />
    </View>
  );
};

const useStyles = () => {
  const myTheme = useTheme();

  return StyleSheet.create({
    appContainer: {
      display: 'flex',
      height: '100%',
      backgroundColor: myTheme.theme.colors.background,
    },
  });
};
