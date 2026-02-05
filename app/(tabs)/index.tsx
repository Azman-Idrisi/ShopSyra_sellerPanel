import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../api/client";

type Seller = {
  _id: string;
  name: string;
  mobile: string;
  isVerified: boolean;
  isActive: boolean;
};

type Product = {
  _id: string;
  seller: string;
  name: string;
  price: number;
  stock: number;
  soldCount: number;
};

export default function Home() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sellerJson = await AsyncStorage.getItem("seller");
        const currentSeller = sellerJson ? JSON.parse(sellerJson) : null;
        setSeller(currentSeller);

        const res = await api.get("/product/getProducts");
        const allProducts: Product[] = res.data?.products ?? [];
        const filtered = currentSeller?._id
          ? allProducts.filter(
              (product) => product.seller === currentSeller._id
            )
          : [];
        setProducts(filtered);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
    const totalSold = products.reduce((sum, p) => sum + (p.soldCount ?? 0), 0);
    const revenue = products.reduce(
      (sum, p) => sum + (p.price ?? 0) * (p.soldCount ?? 0),
      0
    );

    return { totalProducts, totalStock, totalSold, revenue };
  }, [products]);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-2">
          <Text className="text-2xl font-bold text-slate-900">
            Welcome back{seller?.name ? `, ${seller.name}` : ""}
          </Text>
          <Text className="mt-1 text-sm text-slate-500">
            Here is your store performance at a glance.
          </Text>
        </View>

        <View className="mt-5 rounded-3xl bg-slate-900 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-white">
              Store Status
            </Text>
          </View>
          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-slate-300">Seller ID</Text>
              <Text className="mt-1 text-sm font-semibold text-white">
                {seller?._id ? `${seller._id}` : "Not available"}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-slate-300">Status</Text>
              <Text className="mt-1 text-sm font-semibold text-white">
                {seller?.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-bold text-slate-900">Summary</Text>
          {loading ? (
            <View className="mt-4 items-center justify-center rounded-3xl bg-white p-6 shadow-sm">
              <ActivityIndicator size="small" color="#0f172a" />
              <Text className="mt-3 text-sm text-slate-500">
                Loading summary...
              </Text>
            </View>
          ) : (
            <View className="mt-4 flex-row flex-wrap gap-4">
              <View className="flex-1 rounded-3xl bg-white p-4 shadow-sm">
                <Ionicons name="cube" size={20} color="#0f172a" />
                <Text className="mt-3 text-xs text-slate-500">Products</Text>
                <Text className="mt-1 text-lg font-bold text-slate-900">
                  {summary.totalProducts}
                </Text>
              </View>
              <View className="flex-1 rounded-3xl bg-white p-4 shadow-sm">
                <Ionicons name="layers" size={20} color="#0f172a" />
                <Text className="mt-3 text-xs text-slate-500">Total Stock</Text>
                <Text className="mt-1 text-lg font-bold text-slate-900">
                  {summary.totalStock}
                </Text>
              </View>
              <View className="flex-1 rounded-3xl bg-white p-4 shadow-sm">
                <Ionicons name="cart" size={20} color="#0f172a" />
                <Text className="mt-3 text-xs text-slate-500">Sold</Text>
                <Text className="mt-1 text-lg font-bold text-slate-900">
                  {summary.totalSold}
                </Text>
              </View>
              <View className="flex-1 rounded-3xl bg-white p-4 shadow-sm">
                <Ionicons name="cash" size={20} color="#0f172a" />
                <Text className="mt-3 text-xs text-slate-500">Revenue</Text>
                <Text className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrency(summary.revenue)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="mt-6">
          <Text className="text-lg font-bold text-slate-900">
            Quick Actions
          </Text>
          <View className="mt-4 gap-3">
            <Pressable
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
              onPress={() => router.push("/(tabs)/addProduct")}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#0f172a"
                  />
                  <Text className="ml-3 text-base font-semibold text-slate-900">
                    Add new product
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
            </Pressable>
            <Pressable className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name="stats-chart-outline"
                    size={22}
                    color="#0f172a"
                  />
                  <Text className="ml-3 text-base font-semibold text-slate-900">
                    View analytics
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
            </Pressable>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-bold text-slate-900">
            Recent Products
          </Text>
          <View className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
            {products.length === 0 ? (
              <Text className="text-sm text-slate-500">
                No products added yet.
              </Text>
            ) : (
              products.slice(0, 3).map((product) => (
                <View
                  key={product._id}
                  className="flex-row items-center justify-between border-b border-slate-100 py-3 last:border-b-0"
                >
                  <View>
                    <Text className="text-sm font-semibold text-slate-900">
                      {product.name}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500">
                      Stock: {product.stock ?? 0} • Sold:{" "}
                      {product.soldCount ?? 0}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-slate-900">
                    {formatCurrency(product.price ?? 0)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
