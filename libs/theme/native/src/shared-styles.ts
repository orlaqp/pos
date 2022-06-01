import { useTheme } from '@rneui/themed';
import { abort } from 'process';
import { StyleSheet } from 'react-native';



export const useSharedStyles = () => {
    const theme = useTheme();
    return StyleSheet.create({
        page: {
            flex: 1,
            backgroundColor: theme.theme.colors.background,
        },
        pageBackground: {
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
        smallMargin: {
            margin: 10
        },
        mediumMargin: {
            margin: 25
        },
        largeMargin: {
            margin: 50
        },
        rounded: {
            borderRadius: 5
        },
        darkerGrayBackground: {
            backgroundColor: `${theme.theme.colors.grey5}22`,
        },
        darkBackground: {
            backgroundColor: `${theme.theme.colors.background}44`
        },
        itemBackground: {
            backgroundColor: `${theme.theme.colors.grey5}44`,
        },
        labelText: {
            color: theme.theme.colors.grey1
        },
        primaryText: {
            color: theme.theme.colors.black
        },
        secondaryText: {
            color: theme.theme.colors.grey2
        },
        textCenter: { textAlign: 'center'},
        textRight: { textAlign: 'right'},
        textBold: { fontWeight: 'bold' },
        input: {
            padding: 5,
            backgroundColor: theme.theme.colors.grey5,
            textAlign: 'right',
            fontSize: 18,
            borderRadius: 5,
            paddingHorizontal: 10
        },
        subLabel: {
            fontSize: 14,
            color: theme.theme.colors.grey3,
        },
        dataRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: `${theme.theme.colors.grey5}44`,
            padding: 20,
            borderRadius: 10,
            marginBottom: 10,
        },
        smallDataRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: `${theme.theme.colors.grey5}44`,
            padding: 10,
            borderRadius: 10,
            marginBottom: 5,
        },
        name: {
            fontSize: 18,
            color: theme.theme.colors.grey0,
            marginBottom: 5,
        },
        description: {
            fontSize: 14,
            color: theme.theme.colors.grey3,
        },
        inputContainerStyle: {
            marginTop: 10,
            borderRadius: 5,
            borderBottomWidth: 0,
            paddingLeft: 10,
            backgroundColor:
                theme.theme.colors.grey5,
        },
        inputStyle: {
            color: theme.theme.colors.grey1,
            paddingHorizontal: 10,
            textAlign: 'right',
        },
        overlay: {
            backgroundColor: `${theme.theme.colors.background}`,
            borderColor: theme.theme.colors.grey5,
            borderWidth: 1,
            borderRadius: 5,
        },
    });
} 