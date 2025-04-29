import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useSelector } from "react-redux";
import ScreenWrapper from "@/components/ui/ScreenWrapper";

// Dữ liệu mẫu cho các nhà cung cấp dịch vụ
const nearestProviders = [
  {
    id: "1",
    name: "Alana Barber - Haircut massage & Spa",
    image: require("@/assets/images/logo.png"),
    location: "Wayne Newton Blvd",
    distance: "5 Mi",
    rating: 5.0,
  },
  {
    id: "2",
    name: "Hercha Barber - Haircut & Styling",
    image: require("@/assets/images/logo.png"),
    location: "Maryland Parkway",
    distance: "6 Mi",
    rating: 5.0,
  },
  {
    id: "3",
    name: "Barberking - Haircut styling & massage",
    image: require("@/assets/images/logo.png"),
    location: "Wayne Newton Blvd",
    distance: "5 Mi",
    rating: 4.5,
  },
];

const featuredProviders = [
  {
    id: "1",
    name: "Master piece Barber - Haircut styling",
    image: require("@/assets/images/logo.png"),
    location: "Wayne Newton Blvd",
    distance: "5 Mi",
    rating: 5.0,
  },
];

const nearbyServices = [
  {
    id: "1",
    name: "Varcity Barber Jogia at The Varcher",
    image: require("@/assets/images/logo.png"),
    location: "Wayne Newton Blvd",
    distance: "5 Mi",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Barber & Men Stuff",
    image: require("@/assets/images/logo.png"),
    location: "Paradise Rd, Las Vegas",
    distance: "5 Mi",
    rating: 5.0,
  },
  {
    id: "3",
    name: "Barberm - Haircut styling & massage",
    image: require("@/assets/images/logo.png"),
    location: "Paradise Rd, Las Vegas",
    distance: "18 Mi",
    rating: 4.5,
  },
];

// Dữ liệu mẫu cho dịch vụ được đề xuất
const suggestedServices = [
  {
    id: "1",
    name: "Clark's top salon",
    image: require("@/assets/images/logo.png"),
    location: "Wayne Newton Blvd",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Men's Styling",
    image: require("@/assets/images/logo.png"),
    location: "Fremont Street",
    rating: 4.5,
  },
];

const HomeScreen = () => {
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const firstName = userInfo?.firstName || "User";

  const renderProviderItem = ({ item }: { item: any }) => (
    <View style={styles.providerCard}>
      <View style={styles.providerContent}>
        <Image source={item.image} style={styles.providerImage} />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}>
              {item.location} ({item.distance})
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>Provider Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderServiceItem = ({ item }: { item: any }) => (
    <View style={styles.serviceCard}>
      <Image source={item.image} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceLocation}>{item.location}</Text>
        <View style={styles.serviceRating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.serviceDetailButton}>
        <Text style={styles.detailsButtonText}>Provider Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Hello,</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={[styles.iconButton, { marginRight: 8 }]}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.requestButton}>
              <Text style={styles.requestButtonText}>Service Request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Search barber's, haircut services..."
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Nearest Providers Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearest Providers</Text>
            <FlatList
              data={nearestProviders}
              renderItem={renderProviderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See More</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Services Picked Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Services Picked for you</Text>
              <TouchableOpacity>
                <Text style={styles.seeMoreLinkText}>See more</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {suggestedServices.map((service) => (
                <View key={service.id} style={styles.horizontalServiceCard}>
                  <Image
                    source={service.image}
                    style={styles.horizontalServiceImage}
                  />
                  <View style={styles.horizontalServiceDetails}>
                    <Text style={styles.horizontalServiceName}>
                      {service.name}
                    </Text>
                    <View style={styles.horizontalServiceLocation}>
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color="#666"
                      />
                      <Text style={styles.horizontalLocationText}>
                        {service.location}
                      </Text>
                    </View>
                    <View style={styles.horizontalServiceRating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{service.rating}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.serviceDetailButton}>
                    <Text style={styles.detailsButtonText}>
                      Provider Details
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Featured Providers Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Providers</Text>
            <FlatList
              data={featuredProviders}
              renderItem={renderProviderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Nearby Services Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearby Services</Text>
            <FlatList
              data={nearbyServices}
              renderItem={renderProviderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See More</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Map Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Map Search</Text>
            <View style={styles.mapContainer}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.mapImage}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.findNowButton}>
                <Text style={styles.findNowText}>Find now</Text>
                <Ionicons name="search" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom padding for scroll */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    flexDirection: "column",
  },
  greetingText: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  requestButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  requestButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  providerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  providerContent: {
    flexDirection: "row",
  },
  providerImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 4,
    fontWeight: "500",
  },
  detailsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  horizontalScroll: {
    marginVertical: 8,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  serviceImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  serviceInfo: {
    paddingVertical: 4,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  serviceLocation: {
    fontSize: 12,
    color: "#666",
    marginVertical: 2,
  },
  serviceRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceDetailButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  horizontalServiceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    width: 180,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  horizontalServiceImage: {
    width: 156,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  horizontalServiceDetails: {
    paddingVertical: 8,
  },
  horizontalServiceName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  horizontalServiceLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  horizontalLocationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  horizontalServiceRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 8,
  },
  seeMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
    marginRight: 4,
  },
  seeMoreLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  mapContainer: {
    height: 150,
    borderRadius: 12,
    backgroundColor: "#eee",
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  findNowButton: {
    flexDirection: "row",
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  findNowText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 4,
    fontWeight: "500",
  },
});
