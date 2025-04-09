import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLanguage } from "@/hooks/useLanguage";
import { Colors } from "@/constants/Colors";

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: "vi", name: "Tiếng Việt" },
    { code: "en", name: "English" },
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <Pressable
          key={lang.code}
          style={[
            styles.languageButton,
            currentLanguage === lang.code && styles.selectedLanguage,
          ]}
          onPress={() => changeLanguage(lang.code)}
        >
          <Text
            style={[
              styles.languageText,
              currentLanguage === lang.code && styles.selectedLanguageText,
            ]}
          >
            {lang.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  languageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  selectedLanguage: {
    backgroundColor: Colors.white,
  },
  languageText: {
    color: Colors.white,
    fontSize: 14,
  },
  selectedLanguageText: {
    color: Colors.primary,
  },
});

export default LanguageSelector;
