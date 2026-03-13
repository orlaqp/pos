import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

const emptyEntityState = {
  ids: [],
  entities: {},
  selected: null,
  loadingStatus: 'not loaded',
  error: null,
};

const mockRootState: Record<string, any> = {
  auth: { user: null },
  products: emptyEntityState,
  categories: emptyEntityState,
  brands: emptyEntityState,
  unitOfMeasures: emptyEntityState,
  employees: emptyEntityState,
  settings: { globalSettings: {}, logs: [] },
  awsConfig: { config: {} },
  storeInfo: { selected: null },
  printings: emptyEntityState,
  orders: emptyEntityState,
  sales: emptyEntityState,
  inventoryCounts: emptyEntityState,
  inventoryReceives: emptyEntityState,
  reporting: emptyEntityState,
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: (selector: (state: any) => any) => selector(mockRootState),
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useTheme: () => ({ dark: true, colors: { primary: '#2f95dc', background: '#000000' } }),
  NavigationContainer: ({ children }: any) => React.createElement(View, null, children),
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => React.createElement(View, null, children),
    Screen: ({ children }: any) => React.createElement(View, null, children),
  }),
}));

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock(
  'react-native-device-info',
  () => require('react-native-device-info/jest/react-native-device-info-mock'),
  { virtual: true }
);
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/tmp',
  exists: jest.fn(),
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
  MediaType: {},
}));
jest.mock('react-native-date-picker', () => {
  const Comp = (props: any) => React.createElement(View, props, props.children);
  return Comp;
});
jest.mock('react-native-daterange-picker', () => {
  const Comp = (props: any) => React.createElement(View, props, props.children);
  return Comp;
});
jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [{ languageTag: 'en-US', isRTL: false }]),
  getNumberFormatSettings: jest.fn(() => ({
    decimalSeparator: '.',
    groupingSeparator: ',',
  })),
  getCalendar: jest.fn(() => 'gregorian'),
  getCountry: jest.fn(() => 'US'),
  getCurrencies: jest.fn(() => ['USD']),
  getTemperatureUnit: jest.fn(() => 'celsius'),
  getTimeZone: jest.fn(() => 'America/New_York'),
  uses24HourClock: jest.fn(() => false),
  usesMetricSystem: jest.fn(() => false),
  findBestAvailableLanguage: jest.fn(() => ({ languageTag: 'en', isRTL: false })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));
jest.mock('react-native-dropdown-picker', () => {
  const Comp = (props: any) => React.createElement(View, props, props.children);
  return Comp;
});
jest.mock('react-native-chart-kit', () => ({
  LineChart: (props: any) => React.createElement(View, props, props.children),
  PieChart: (props: any) => React.createElement(View, props, props.children),
}));
jest.mock('react-native-gesture-handler', () => {
  const Mock = (props: any) => React.createElement(View, props, props.children);
  return {
    GestureHandlerRootView: Mock,
    Swipeable: Mock,
    PanGestureHandler: Mock,
    TapGestureHandler: Mock,
    TouchableOpacity,
    TouchableHighlight: TouchableOpacity,
    TouchableWithoutFeedback: TouchableOpacity,
    ScrollView: Mock,
    State: {},
  };
});
jest.mock('react-native-star-io10', () => ({
  InterfaceType: { Lan: 'Lan' },
  StarConnectionSettings: jest.fn(),
  StarDeviceDiscoveryManager: jest.fn(),
  StarDeviceDiscoveryManagerFactory: { create: jest.fn() },
  StarPrinter: jest.fn(),
  StarXpandCommand: {
    PrinterBuilder: jest.fn(),
    MagnificationParameter: jest.fn(),
    DocumentBuilder: jest.fn(),
    StarXpandCommandBuilder: jest.fn(),
    Printer: {
      Alignment: { Center: 'Center', Left: 'Left', Right: 'Right' },
      InternationalCharacterType: { Usa: 'Usa' },
      QRCodeModel: { Model2: 'Model2' },
      QRCodeLevel: { L: 'L' },
      QRCodeParameter: jest.fn(),
    },
  },
}));
jest.mock('react-native-star-io10/src/StarXpandCommand/Printer/CutType', () => ({
  CutType: { Partial: 'Partial' },
}));
jest.mock('react-native-star-io10/src/StarXpandCommand/Printer/Alignment', () => ({
  Alignment: { Center: 'Center' },
}));
jest.mock('@pos/theme/native', () => ({
  useSharedStyles: () => {
    const baseStyles: Record<string, any> = {
      page: {},
      box: {},
      column: {},
      row: { flexDirection: 'row' },
      centered: { alignItems: 'center', justifyContent: 'center' },
      centeredHorizontally: { alignItems: 'center' },
      alignEnd: { justifyContent: 'flex-end' },
      dataRow: { backgroundColor: '#202020' },
      backgroundColor: { backgroundColor: '#202020' },
      primaryText: { color: '#ffffff' },
      secondaryText: { color: '#aaaaaa' },
      textRight: { textAlign: 'right' },
      textWarning: { color: '#f59e0b' },
      textBold: { fontWeight: '700' },
      smallMargin: { margin: 8 },
      name: { color: '#ffffff' },
      description: { color: '#aaaaaa' },
      barcode: { color: '#aaaaaa' },
      inputContainerStyle: {},
      inputStyle: { color: '#ffffff' },
    };
    return new Proxy(baseStyles, {
      get: (target, prop: string) => target[prop] ?? {},
    });
  },
}));
jest.mock('@rneui/themed', () => {
  const mk = (Base: any = View) =>
    React.forwardRef((props: any, ref: any) =>
      React.createElement(Base, { ...props, ref }, props.children)
    );

  const ListItem: any = mk(TouchableOpacity);
  ListItem.Content = mk(View);
  ListItem.Title = mk(Text);
  ListItem.Subtitle = mk(Text);
  ListItem.Chevron = mk(View);
  ListItem.Swipeable = mk(View);

  return {
    Avatar: mk(View),
    Badge: mk(View),
    BottomSheet: mk(View),
    Button: mk(TouchableOpacity),
    ButtonGroup: mk(View),
    Card: mk(View),
    CheckBox: mk(TouchableOpacity),
    Divider: mk(View),
    FAB: mk(TouchableOpacity),
    Header: mk(View),
    Icon: mk(View),
    Image: mk(View),
    Input: mk(TextInput),
    ListItem,
    Overlay: mk(View),
    Slider: mk(View),
    SpeedDial: mk(View),
    Switch: mk(View),
    Tab: mk(View),
    Text: mk(Text),
    Tile: mk(View),
    Tooltip: mk(View),
    useTheme: () => ({
      theme: {
        colors: {
          primary: '#2f95dc',
          secondary: '#666666',
          black: '#000000',
          white: '#ffffff',
          grey0: '#111111',
          grey1: '#222222',
          grey2: '#333333',
          grey3: '#444444',
          grey4: '#555555',
          greyOutline: '#777777',
          warning: '#f59e0b',
          error: '#ef4444',
          success: '#10b981',
        },
      },
    }),
    ThemeProvider: mk(View),
    withTheme: (Component: any) => Component,
  };
});
jest.mock('@rneui/base', () => jest.requireMock('@rneui/themed'));
