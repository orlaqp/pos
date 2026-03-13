const React = require('react');
const { View, TouchableOpacity } = require('react-native');

const Mock = React.forwardRef((props, ref) =>
  React.createElement(View, { ...props, ref }, props.children)
);

module.exports = {
  GestureHandlerRootView: Mock,
  NativeViewGestureHandler: Mock,
  TapGestureHandler: Mock,
  PanGestureHandler: Mock,
  ScrollView: Mock,
  Swipeable: Mock,
  TouchableOpacity,
  TouchableHighlight: TouchableOpacity,
  TouchableWithoutFeedback: TouchableOpacity,
  State: {},
};
