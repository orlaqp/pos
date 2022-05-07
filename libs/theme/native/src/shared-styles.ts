import { useTheme } from '@rneui/themed';
import { StyleSheet } from 'react-native';



export const useSharedStyles = () => {
    const theme = useTheme();
    return StyleSheet.create({
        page: {
            flex: 1,
            backgroundColor: theme.theme.colors.background,
        },
        detailsPage: {
            flex: 1,
            flexDirection: 'column',
            backgroundColor: theme.theme.colors.background,
        },
        centered: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        centeredHorizontally: {
            alignItems: 'center'
        },
        row: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        column: {
            flexDirection: "column",
        },
        rounded: {
            borderRadius: 5
        },
        darkerGrayBackground: {
            backgroundColor: `${theme.theme.colors.grey5}22`,
        },
        darkBackground: {
            backgroundColor: `${theme.theme.colors.searchBg}44`
        }
    });
} 