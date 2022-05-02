import { useSharedStyles } from '@pos/theme/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, Button, Card } from '@rneui/themed';
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PathDetails {
  title: string;
  path: string;
  icon: string;
}

interface HomeScreenProps {
    navigation: NativeStackNavigationProp<any>;
}

export const HomeScreen = (props: HomeScreenProps) => {
  const theme = useTheme();
  const sharedStyles = useSharedStyles();
  const styles = useStyles();
  const paths: PathDetails[] = [
    { title: 'Sales', path: 'Sales', icon: 'cart' },
    { title: 'Payments', path: 'Payments', icon: 'cash' },
    { title: 'Back Office', path: 'BackOffice', icon: 'barcode' },
  ];
  const goto = (details: PathDetails) => props.navigation.navigate(details.path);

  return (
    <View style={[sharedStyles.page, sharedStyles.centered]}>
      <View style={{ flexDirection: 'row' }}>
        {paths.map((p) => (
          <TouchableOpacity onPress={() => goto(p)}>
            <View style={[styles.bigButton, sharedStyles.centered]}>
              <Icon
                name={p.icon}
                size={60}
                color={theme.theme.colors.divider}
              />
              <Text style={{ color: theme.theme.colors.black }}>{p.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    icon: {
      color: theme.theme.colors.white,
    },
    bigButton: {
        backgroundColor: theme.theme.colors.grey5,
      borderColor: theme.theme.colors.greyOutline,
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 10,
      margin: 15,
      padding: 20,
      minWidth: 150,
      minHeight: 150,
    //   shadowColor: '#ccc',
    //   shadowOffset: {
    //     width: 0,
    //     height: 1,
    //   },
    //   shadowOpacity: 0.22,
    //   shadowRadius: 2.22,
    //   elevation: 3,
    },
  });
};
