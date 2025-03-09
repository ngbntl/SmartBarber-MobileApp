import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

const index = () => {
  return (
    <View>
      <Image
        className="w-10 h-10"
        source={require("@/assets/images/logo.png")}
      />
      <Text className="text-3xl text-center items-center">Auth Screen</Text>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});
