import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/api/client";

const AUTH_TOKEN_KEY = "shopsyra_seller_auth_token";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  setSession: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!savedToken) {
          return;
        }

        // Set the token on the API client and validate with the backend
        api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
        const response = await api.get("/seller/me");

        // Cache the seller data for offline/quick access
        if (response.data.seller) {
          await AsyncStorage.setItem("seller", JSON.stringify(response.data.seller));
        }

        if (mounted) {
          setToken(savedToken);
        }
      } catch (error) {
        console.error("Session restore failed:", error);
        delete api.defaults.headers.common.Authorization;
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, "seller"]);
        if (mounted) {
          setToken(null);
        }
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const setSession = async (nextToken: string) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    setToken(nextToken);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, "seller"]);
    delete api.defaults.headers.common.Authorization;
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isAuthLoading,
      setSession,
      logout,
    }),
    [token, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
