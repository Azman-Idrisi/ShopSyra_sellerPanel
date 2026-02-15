import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { View, StyleSheet, ActivityIndicator, StatusBar } from "react-native";
import { useEffect, useRef, useCallback } from "react";

function SplashScreen() {
  return (
    <View style={splash.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ActivityIndicator size="large" color="#1800ad" />
    </View>
  );
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});

function NavigationHandler({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const rawSegments = useSegments();
  const segments = rawSegments as string[];
  const hasNavigated = useRef(false);

  const handleNavigation = useCallback(() => {
    if (isAuthLoading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inAuthGroup = segments[0] === "(auth)";

    if (isAuthenticated && !inTabsGroup) {
      router.replace("/(tabs)");
      hasNavigated.current = true;
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/signin");
      hasNavigated.current = true;
    }
  }, [isAuthLoading, isAuthenticated, segments, router]);

  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  if (isAuthLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationHandler>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              animationTypeForReplace: "push",
            }}
          />
        </NavigationHandler>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
