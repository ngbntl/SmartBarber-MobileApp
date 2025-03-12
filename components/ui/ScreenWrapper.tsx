import { StyleSheet, View } from "react-native";
import React, { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenWrapperProps = {
  children: ReactNode;
  bg?: string;
};

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, bg }) => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 30;

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop }]}>
      {children}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
