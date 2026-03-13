import '@testing-library/jest-native/extend-expect';

jest.mock('@rneui/themed', () => {
    const actual = jest.requireActual('@rneui/themed');
    return {
        ...actual,
        useTheme: () => ({
            theme: {
                colors: {
                    background: '#000000',
                    primary: '#4da3ff',
                    grey0: '#ffffff',
                    grey2: '#9ba6b4',
                    grey3: '#7f8a99',
                    grey5: '#3c434d',
                    error: '#ff4d4f',
                },
            },
        }),
    };
});
