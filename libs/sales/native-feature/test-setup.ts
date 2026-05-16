/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn().mockResolvedValue({ isConnected: true }),
    useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
    watchKeys: jest.fn(() => 0),
    clearWatch: jest.fn(),
}));

jest.mock('react-native/Libraries/Vibration/Vibration', () => ({
    vibrate: jest.fn(),
    cancel: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(() => []),
}));

jest.mock('react-native-fs', () => ({
    CachesDirectoryPath: '/tmp',
    DocumentDirectoryPath: '/tmp',
    exists: jest.fn().mockResolvedValue(false),
    readFile: jest.fn().mockResolvedValue(''),
    writeFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@pos/shared/amplify', () => ({
    Amplify: {
        configure: jest.fn(),
    },
    Auth: {
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
        currentAuthenticatedUser: jest.fn(),
    },
    Storage: {
        get: jest.fn().mockResolvedValue('https://example.com/mock.png'),
        put: jest.fn().mockResolvedValue({}),
        remove: jest.fn().mockResolvedValue({}),
    },
    DataStore: {
        query: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('@aws-amplify/datastore', () => ({
    initSchema: jest.fn(() => ({})),
    DataStore: {
        query: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        observe: jest.fn(),
        observeQuery: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        clear: jest.fn(),
        configure: jest.fn(),
    },
    syncExpression: jest.fn(),
}));

jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn().mockResolvedValue({ didCancel: true }),
}));

jest.mock('@react-native-community/datetimepicker', () => {
    const React = require('react');
    const RN = require('react-native');
    return ({ testID }: { testID?: string }) =>
        React.createElement(RN.View, { testID: testID || 'mock-date-picker' });
});

jest.mock('react-native-numeric-input', () => {
    const React = require('react');
    const RN = require('react-native');
    return ({ value, onChange, testID }: any) =>
        React.createElement(
            RN.Pressable,
            {
                testID: testID || 'mock-numeric-input',
                onPress: () => onChange?.(value),
            },
            React.createElement(RN.Text, null, String(value ?? 0))
        );
});

jest.mock('react-native-uuid', () => ({
    v4: jest.fn(() => 'test-uuid'),
}));

jest.mock('react-native-device-info', () => ({
    getSystemName: jest.fn(() => 'iOS'),
    getVersion: jest.fn(() => '1.0.0'),
    getBuildNumber: jest.fn(() => '1'),
    getUniqueId: jest.fn(() => 'device-id'),
}));

jest.mock('react-native-gesture-handler', () => {
    const RN = require('react-native');
    return {
        ScrollView: RN.ScrollView,
        FlatList: RN.FlatList,
        TouchableOpacity: RN.TouchableOpacity,
        PanGestureHandler: ({ children }: { children: React.ReactNode }) =>
            children,
        State: {},
    };
});

jest.mock('@rneui/themed', () => {
    const React = require('react');
    const RN = require('react-native');

    const theme = {
        colors: {
            primary: '#4aa3eb',
            error: '#ff5f5f',
            warning: '#ffb020',
            success: '#34c759',
            grey0: '#ffffff',
            grey1: '#d6dde6',
            grey2: '#9aa9bb',
            grey3: '#7c8a9b',
            grey4: '#5a6573',
            grey5: '#2a313b',
            black: '#f5f7fb',
            background: '#0b0f14',
        },
    };

    const Button = ({
        title,
        onPress,
        testID,
        children,
    }: {
        title?: string;
        onPress?: () => void;
        testID?: string;
        children?: React.ReactNode;
    }) =>
        React.createElement(
            RN.Pressable,
            { testID: testID || title, onPress },
            title ? React.createElement(RN.Text, null, title) : null,
            children
        );

    const Input = React.forwardRef(
        (
            {
                value,
                onChangeText,
                onSubmitEditing,
                rightIcon,
                placeholder,
                testID,
            }: any,
            ref: any
        ) =>
            React.createElement(
                RN.View,
                null,
                React.createElement(RN.TextInput, {
                    ref,
                    testID: testID || 'mock-input',
                    value,
                    placeholder,
                    onChangeText,
                    onSubmitEditing: (e: any) => onSubmitEditing?.(e),
                }),
                rightIcon?.onPress
                    ? React.createElement(RN.Pressable, {
                          testID: 'mock-input-right-icon',
                          onPress: rightIcon.onPress,
                      })
                    : null
            )
    );

    const Dialog = ({
        isVisible,
        children,
    }: {
        isVisible?: boolean;
        children?: React.ReactNode;
    }) =>
        isVisible ? React.createElement(RN.View, null, children) : null;

    const ButtonGroup = ({
        buttons = [],
        onPress,
        selectedIndex,
    }: {
        buttons?: string[];
        selectedIndex?: number;
        onPress?: (index: number) => void;
    }) =>
        React.createElement(
            RN.View,
            null,
            ...buttons.map((button, index) =>
                React.createElement(
                    RN.Pressable,
                    {
                        key: button,
                        testID: `status-${button}`,
                        onPress: () => onPress?.(index),
                    },
                    React.createElement(
                        RN.Text,
                        null,
                        `${button}${selectedIndex === index ? ' selected' : ''}`
                    )
                )
            )
        );

    const Icon = ({ name, testID }: { name?: string; testID?: string }) =>
        React.createElement(RN.Text, { testID }, name || 'icon');

    const Switch = ({
        value,
        onValueChange,
        testID,
    }: {
        value?: boolean;
        onValueChange?: (value: boolean) => void;
        testID?: string;
    }) =>
        React.createElement(
            RN.Pressable,
            {
                testID: testID || 'mock-switch',
                onPress: () => onValueChange?.(!value),
            },
            React.createElement(RN.Text, null, value ? 'on' : 'off')
        );

    return {
        useTheme: () => ({ theme }),
        ThemeProvider: ({ children }: { children: React.ReactNode }) =>
            React.createElement(React.Fragment, null, children),
        Button,
        Input,
        Dialog,
        ButtonGroup,
        Icon,
        Switch,
    };
});
