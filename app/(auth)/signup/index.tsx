import { api } from "@/api/client";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [userType, setUserType] = useState("seller");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!mobile.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const signup = async () => {
    const isValid = validate();
    if (!isValid) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/seller/createSeller", {
        mobile: mobile.trim(),
        name: name.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        userType: userType,
      });
      setSuccess(true);
      router.push({
        pathname: "/(auth)/signin",
        params: { mobile: mobile.trim() },
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-semibold text-slate-900">
            Seller account
          </Text>
          <Text className="mt-2 text-base text-slate-500">
            Create your seller profile to start listing products.
          </Text>
        </View>

        {error ? (
          <View className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <Text className="text-sm text-rose-700">
              Error in signing up. Please try again.
            </Text>
          </View>
        ) : null}

        {success ? (
          <View className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Text className="text-sm text-emerald-700">
              Seller profile created successfully.
            </Text>
          </View>
        ) : null}

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
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-slate-700">
              Full name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seller name"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-slate-700">
              Email address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@business.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-slate-700">
              Store address
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Street, city, country"
              multiline
              className="min-h-[88px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
              textAlignVertical="top"
            />
          </View>
        </View>

        <Pressable
          className="mt-8 rounded-2xl bg-slate-900 px-4 py-4"
          android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          onPress={signup}
          disabled={loading}
        >
          <Text className="text-center text-base font-semibold text-white">
            {loading ? "Creating..." : "Create seller profile"}
          </Text>
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-slate-500">
            Already have an account?
          </Text>
          <Link href="/(auth)/signin" className="ml-2">
            <Text className="text-sm font-semibold text-slate-900">
              Sign in
            </Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
