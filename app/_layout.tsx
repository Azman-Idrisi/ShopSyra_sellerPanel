import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import "../global.css";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const router = useRouter();

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const auth = await AsyncStorage.getItem("isAuthenticated");
      const seller = await AsyncStorage.getItem("seller");
      if (auth === "true" && seller) {
        setIsAuthenticated(true);
        router.replace("/(tabs)");
      } else {
        setIsAuthenticated(false);
        router.replace("/(auth)/signin");
      }
    } catch (error: any) {
      console.error("Error checking login:", error);
      router.replace("/(auth)/signin");
    }
  };
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationTypeForReplace: "push",
      }}
    />
  );
}
