import { useTheme } from '@rneui/themed';
import { StyleSheet } from 'react-native';

export const useSharedStyles = () => {
    const theme = useTheme();
    return StyleSheet.create({
        page: {
            flex: 1,
            backgroundColor: theme.theme.colors.background,
        },
        centered: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        row: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        column: {
            flexDirection: "column",
        },
    });
} 