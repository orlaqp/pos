import { useTheme } from '@rneui/themed';
import { StyleSheet } from 'react-native';



export const useSharedStyles = () => {
    const theme = useTheme();
    const colors = theme?.theme?.colors || {
        background: '#000000',
        grey0: '#ffffff',
        grey1: '#dddddd',
        grey2: '#aaaaaa',
        grey3: '#777777',
        grey4: '#666666',
        grey5: '#444444',
        black: '#ffffff',
        error: '#ef4444',
        warning: '#ffb020',
        success: '#34c759',
    };
    return StyleSheet.create({
        page: {
            flex: 1,
            backgroundColor: colors.background,
        },
        pageBackground: {
            backgroundColor: colors.background,
        },
        detailsPage: {
            flex: 1,
            flexDirection: 'column',
            backgroundColor: colors.background,
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
            backgroundColor: `${colors.grey5}22`,
        },
        darkBackground: {
            backgroundColor: `${colors.background}44`
        },
        backgroundColor: {
            backgroundColor: colors.background
        },
        itemBackground: {
            backgroundColor: `${colors.grey5}44`,
        },
        dangerBackground: {
            backgroundColor: `${colors.error}88`,
        },
        warningBackground: {
            backgroundColor: `${colors.warning}88`,
        },
        labelText: {
            color: colors.grey1
        },
        primaryText: {
            color: colors.black
        },
        secondaryText: {
            color: colors.grey2
        },
        veryLightText: {
            color: colors.grey4
        },
        textCenter: { textAlign: 'center'},
        textRight: { textAlign: 'right'},
        textSuccess: { color: colors.success },
        textWarning: { color: colors.warning },
        textError: { color: colors.error },
        textBold: { fontWeight: 'bold' },
        backgroundSuccess: { backgroundColor: colors.success },
        backgroundWarning: { backgroundColor: colors.warning },
        backgroundError: { backgroundColor: colors.error },
        input: {
            padding: 5,
            backgroundColor: colors.grey5,
            textAlign: 'right',
            fontSize: 18,
            borderRadius: 5,
            paddingHorizontal: 10
        },
        subLabel: {
            fontSize: 14,
            color: colors.grey3,
        },
        dataRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: `${colors.grey5}44`,
            padding: 20,
            borderRadius: 10,
            marginBottom: 10,
        },
        box: {
            backgroundColor: `${colors.grey5}44`,
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
            backgroundColor: `${colors.grey5}44`,
            padding: 10,
            borderRadius: 10,
            marginBottom: 5,
        },
        miniDataRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: `${colors.grey5}44`,
            padding: 5,
            borderRadius: 10,
            marginBottom: 5,
        },
        name: {
            fontSize: 18,
            color: colors.grey0,
            marginBottom: 5,
        },
        description: {
            fontSize: 14,
            color: colors.grey3,
        },
        inputContainerStyle: {
            marginTop: 10,
            borderRadius: 5,
            borderBottomWidth: 0,
            paddingLeft: 10,
            backgroundColor:
                colors.grey5,
        },
        inputStyle: {
            color: colors.grey1,
            paddingHorizontal: 10,
            textAlign: 'right',
        },
        overlay: {
            backgroundColor: `${colors.background}`,
            borderColor: colors.grey5,
            borderWidth: 1,
            borderRadius: 5,
        },
    });
} 
