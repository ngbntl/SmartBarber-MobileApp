import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useSelector } from "react-redux";
import { useLogout } from "@/utils/auth";
import { useTranslation } from "react-i18next";

const SettingsScreen = () => {
  const { t } = useTranslation();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const logout = useLogout();
  const firstName = userInfo?.firstName || "Matthew";
  const lastName = userInfo?.lastName || "McCoy";
  const email = userInfo?.email || "matthew.mccoy@example.com";

  const handleLogout = () => {
    Alert.alert(
      t("settings.logout_title", "Logout"),
      t("settings.logout_message", "Are you sure you want to logout?"),
      [
        {
          text: t("common.cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("common.logout", "Logout"),
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: "person-outline", label: "Personal Information" },
        { icon: "wallet-outline", label: "Payment Methods" },
        { icon: "location-outline", label: "Saved Addresses" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: "notifications-outline", label: "Notifications" },
        { icon: "moon-outline", label: "Dark Mode" },
        { icon: "language-outline", label: "Language" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "help-circle-outline", label: "Help Center" },
        { icon: "chatbox-outline", label: "Contact Us" },
        { icon: "document-text-outline", label: "Terms & Privacy Policy" },
      ],
    },
  ];

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Account</Text>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {firstName} {lastName}
              </Text>
              <Text style={styles.profileEmail}>{email}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Settings Sections */}
          {settingsSections.map((section, index) => (
            <View key={index} style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity key={itemIndex} style={styles.settingItem}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={22} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text style={styles.logoutText}>
              {t("settings.logout", "Log Out")}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eee",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF3B30",
    marginLeft: 8,
  },
});
