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
        alignEnd: {
            justifyContent: 'flex-end'
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
        backgroundColor: {
            backgroundColor: theme.theme.colors.background
        },
        itemBackground: {
            backgroundColor: `${theme.theme.colors.grey5}44`,
        },
        dangerBackground: {
            backgroundColor: `${theme.theme.colors.error}88`,
        },
        warningBackground: {
            backgroundColor: `${theme.theme.colors.warning}88`,
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
        veryLightText: {
            color: theme.theme.colors.grey4
        },
        textCenter: { textAlign: 'center'},
        textRight: { textAlign: 'right'},
        textSuccess: { color: theme.theme.colors.success },
        textWarning: { color: theme.theme.colors.warning },
        textError: { color: theme.theme.colors.error },
        textBold: { fontWeight: 'bold' },
        backgroundSuccess: { backgroundColor: theme.theme.colors.success },
        backgroundWarning: { backgroundColor: theme.theme.colors.warning },
        backgroundError: { backgroundColor: theme.theme.colors.error },
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
        box: {
            backgroundColor: `${theme.theme.colors.grey5}44`,
            padding: 20,
            borderRadius: 10,
            marginBottom: 10,
            zIndex: 0
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
        miniDataRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: `${theme.theme.colors.grey5}44`,
            padding: 5,
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