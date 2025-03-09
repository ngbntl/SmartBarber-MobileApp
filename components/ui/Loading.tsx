import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";

const Loading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
});

export default Loading;
