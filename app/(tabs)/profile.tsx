import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

interface Seller {
  _id: string;
  mobile: string;
  name: string;
  email?: string;
  address?: string;
  shopName?: string;
  shopAddress?: string;
  gstNumber?: string;
  isVerified: boolean;
  isActive: boolean;
  userType: string;
  createdAt: string;
}

export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSellerData();
  }, []);

  const loadSellerData = async () => {
    try {
      const response = await api.get("/seller/me");
      if (response.data.seller) {
        setSeller(response.data.seller);
      }
    } catch (error) {
      console.error("Error loading seller data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSellerData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/signin");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-0"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Card */}
        <View className="px-6 mt-8">
          <View className="bg-white rounded-3xl shadow-lg px-6 pt-6 pb-5">
            <View className="items-center">
              {/* Avatar */}
              <LinearGradient
                colors={["#3b82f6", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-24 w-24 items-center justify-center rounded-full mb-4"
              >
                <Text className="text-3xl font-bold text-white">
                  {seller ? getInitials(seller.name) : "??"}
                </Text>
              </LinearGradient>

              {/* Name & Email */}
              <Text className="text-2xl font-bold text-slate-900 mb-1">
                {seller?.name || "Loading..."}
              </Text>
              {seller?.email && (
                <Text className="text-sm text-slate-500 mb-3">
                  {seller.email}
                </Text>
              )}

              {/* Member Since */}
              {seller?.createdAt && (
                <Text className="text-xs text-slate-400">
                  Member since {formatDate(seller.createdAt)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Contact Information Section */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-slate-900 mb-4">
            Contact Information
          </Text>

          <View className="bg-white rounded-2xl shadow-sm">
            {/* Mobile */}
            <View className="p-4 border-b border-slate-100">
              <View className="flex-row items-center">
                <View className="h-10 w-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="call" size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-slate-500 mb-1">
                    Mobile Number
                  </Text>
                  <Text className="text-base font-semibold text-slate-900">
                    {seller?.mobile || "Not provided"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Email */}
            {seller?.email && (
              <View className="p-4 border-b border-slate-100">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="mail" size={20} color="#9333ea" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-slate-500 mb-1">
                      Email Address
                    </Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {seller.email}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Address */}
            {seller?.address && (
              <View className="p-4">
                <View className="flex-row items-start">
                  <View className="h-10 w-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="location" size={20} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-slate-500 mb-1">Address</Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {seller.address}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Business Information Section */}
        {(seller?.shopName || seller?.shopAddress || seller?.gstNumber) && (
          <View className="px-6 mt-6">
            <Text className="text-lg font-bold text-slate-900 mb-4">
              Business Information
            </Text>

            <View className="bg-white rounded-2xl shadow-sm">
              {/* Shop Name */}
              {seller?.shopName && (
                <View className="p-4 border-b border-slate-100">
                  <View className="flex-row items-center">
                    <View className="h-10 w-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="storefront" size={20} color="#ea580c" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-slate-500 mb-1">
                        Shop Name
                      </Text>
                      <Text className="text-base font-semibold text-slate-900">
                        {seller.shopName}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Shop Address */}
              {seller?.shopAddress && (
                <View className="p-4 border-b border-slate-100">
                  <View className="flex-row items-start">
                    <View className="h-10 w-10 bg-pink-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="business" size={20} color="#db2777" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-slate-500 mb-1">
                        Shop Address
                      </Text>
                      <Text className="text-base font-semibold text-slate-900">
                        {seller.shopAddress}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* GST Number */}
              {seller?.gstNumber && (
                <View className="p-4">
                  <View className="flex-row items-center">
                    <View className="h-10 w-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name="document-text"
                        size={20}
                        color="#4f46e5"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-slate-500 mb-1">
                        GST Number
                      </Text>
                      <Text className="text-base font-semibold text-slate-900">
                        {seller.gstNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="px-6 mt-6 gap-3">
          <Pressable
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
            android_ripple={{ color: "rgba(15,23,42,0.08)" }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="create-outline" size={24} color="#0f172a" />
                <Text className="text-base font-semibold text-slate-900 ml-3">
                  Edit Profile
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </View>
          </Pressable>

          <Pressable
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
            android_ripple={{ color: "rgba(15,23,42,0.08)" }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color="#0f172a"
                />
                <Text className="text-base font-semibold text-slate-900 ml-3">
                  Help & Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </View>
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            className="bg-red-500 rounded-2xl p-4 shadow-sm mt-2"
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={24} color="white" />
              <Text className="text-base font-bold text-white ml-3">
                Sign Out
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
