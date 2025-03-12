import { StyleProp, ViewStyle } from "react-native";

export interface CusButtonInterface {
  title: string;
  style?: StyleProp<ViewStyle>;
  flatListRef?: any;
  flatListIndex: any;
  dataLength: any;
}

export interface ButtonInterface {
  title: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyles?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
  hasShadow?: boolean;
  onPress?: () => void;
}
