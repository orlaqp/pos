import { createTheme, ThemeMode } from '@rneui/themed';

export const theme = (mode: ThemeMode) => createTheme({
    mode,
    // lightColors: {
    //     ...Platform.select({
    //         default: lightColors.platform.ios,
    //         ios: lightColors.platform.ios,
    //     }),
    // },
    // darkColors: {
    //     ...Platform.select({
    //         default: lightColors.platform.ios,
    //         ios: lightColors.platform.ios,
    //     })
    // },
    // Button: {
    //     raised: true,
    // },
    // Input: {
    //     inputContainerStyle: { borderWidth: 1 }
    // }
}); 
