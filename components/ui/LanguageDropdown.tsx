import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { useLanguage } from "@/hooks/useLanguage";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const languages = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

const LanguageDropdown = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage = languages.find(
    (lang) => lang.code === currentLanguage
  );

  const handleLanguageChange = (code: string) => {
    try {
      changeLanguage(code);
      setIsOpen(false);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.flagText}>{selectedLanguage?.flag}</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.dropdown}>
            {languages.map((lang) => (
              <Pressable
                key={lang.code}
                style={[
                  styles.dropdownItem,
                  currentLanguage === lang.code && styles.selectedItem,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.flagText}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.dropdownText,
                    currentLanguage === lang.code && styles.selectedText,
                  ]}
                >
                  {lang.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    top: 40,
    right: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.button,
    gap: 4,
  },
  flagText: {
    fontSize: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: Colors.primary,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.primary,
  },
  selectedText: {
    color: Colors.white,
  },
});

export default LanguageDropdown;
