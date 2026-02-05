import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../api/client";

export default function SigninScreen() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);


  const handleSendOtp = async () => {
    if (!mobile.trim()) {
      Alert.alert("Error", "Please enter your mobile number");
      return;
    }

    // Basic validation for mobile number
    if (mobile.length < 10) {
      Alert.alert("Error", "Please enter a valid mobile number");
      return;
    }

    try {
      setIsSendingOtp(true);
      const response = await api.post("/otp/send-otp", {
        mobile: `+91${mobile.trim()}`,
      });

      if (response.data.success) {
        setIsOtpSent(true);
        Alert.alert("Success", "OTP sent successfully to your mobile number");
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Send OTP error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP and sign in
  const handleVerifyAndSignIn = async () => {
    if (!mobile.trim() || !otp.trim()) {
      Alert.alert("Error", "Please enter both mobile number and OTP");
      return;
    }

    if (otp.length !== 4) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsVerifying(true);

     const body = {
      mobile: `+91${mobile.trim()}`,
      otp: otp.trim(),
     };
     
      const verifyResponse = await api.post("/otp/verify-otp", body);

      if (!verifyResponse.data.success) {
        Alert.alert("Error", "Invalid OTP. Please try again.");
        return;
      }

      // Step 2: Check if seller exists
      const sellerResponse = await api.get(`/seller/+91${mobile.trim()}`);

      if (sellerResponse.data.seller) {
        // Seller exists - Sign in
        const seller = sellerResponse.data.seller;

        // Store seller data in AsyncStorage
        await AsyncStorage.setItem("seller", JSON.stringify(seller));
        await AsyncStorage.setItem("isAuthenticated", "true");
        await AsyncStorage.setItem("mobile", mobile.trim());
        router.replace("/(tabs)");
        
      } else {
        // Seller doesn't exist - redirect to signup
        Alert.alert(
          "Account Not Found",
          "No seller account found with this mobile number. Please create an account.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Sign Up",
              onPress: () => {
                router.push({
                  pathname: "/(auth)/signup",
                  params: { mobile: mobile.trim() },
                });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Verify & Sign In error:", error);
      
      if (error.response?.status === 404) {
        // Seller not found
        Alert.alert(
          "Account Not Found",
          "No seller account found. Would you like to create one?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Sign Up",
              onPress: () => {
                router.push({
                  pathname: "/(auth)/signup",
                  params: { mobile: mobile.trim() },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to sign in. Please try again."
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-semibold text-slate-900">
            Welcome back
          </Text>
          <Text className="mt-2 text-base text-slate-500">
            Sign in with your mobile number and one-time password.
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="mb-2 text-sm font-medium text-slate-700">
              Mobile number
            </Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="e.g. +91 98765 43210"
              keyboardType="phone-pad"
              editable={!isOtpSent}
              className={`rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 ${
                isOtpSent ? "bg-slate-100" : "bg-white"
              }`}
            />
          </View>

          {isOtpSent && (
            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                OTP
              </Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                maxLength={6}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 tracking-[3px]"
              />
              <Text className="mt-2 text-xs text-slate-500">
                Enter the code sent to your mobile number.
              </Text>
            </View>
          )}
        </View>

        {!isOtpSent ? (
          <Pressable
            onPress={handleSendOtp}
            disabled={isSendingOtp}
            className={`mt-6 rounded-2xl px-4 py-4 ${
              isSendingOtp ? "bg-slate-700" : "bg-slate-900"
            }`}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          >
            {isSendingOtp ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Send OTP
              </Text>
            )}
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={handleVerifyAndSignIn}
              disabled={isVerifying}
              className={`mt-6 rounded-2xl px-4 py-4 ${
                isVerifying ? "bg-slate-700" : "bg-slate-900"
              }`}
              android_ripple={{ color: "rgba(255,255,255,0.15)" }}
            >
              {isVerifying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-base font-semibold text-white">
                  Verify &amp; sign in
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setIsOtpSent(false);
                setOtp("");
              }}
              className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4"
              android_ripple={{ color: "rgba(15,23,42,0.08)" }}
            >
              <Text className="text-center text-base font-semibold text-slate-900">
                Change Mobile Number
              </Text>
            </Pressable>
          </>
        )}

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-slate-500">New here?</Text>
          <Link href="/(auth)/signup" className="ml-2">
            <Text className="text-sm font-semibold text-slate-900">
              Create an account
            </Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}