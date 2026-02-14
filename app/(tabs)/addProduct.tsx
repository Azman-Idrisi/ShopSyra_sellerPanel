import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../api/client";
import { router } from "expo-router";

type ImageItem = {
  uri: string;
  url?: string;
  uploading: boolean;
};

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("clothing");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const colorOptions = ["Black", "White", "Blue", "Red", "Green", "Beige"];
  const maxImages = 6;

  useEffect(() => {
    const loadSeller = async () => {
      try {
        const sellerJson = await AsyncStorage.getItem("seller");
        const seller = sellerJson ? JSON.parse(sellerJson) : null;
        setSellerId(seller?._id ?? null);
      } catch (error) {
        console.log(error);
      }
    };

    loadSeller();
  }, []);

  function clearFields() {
    setName("");
    setDescription("");
    setCategory("clothing");
    setPrice("");
    setStock("");
    setSize("");
    setColor("");
  }

  const uploadImage = async (uri: string) => {
    const formData = new FormData();

    formData.append("image", {
      uri,
      name: "image.jpg",
      type: "image/jpeg",
    } as any);

    const uploadEndpoint = `${api.defaults.baseURL}/upload/uploadimage`;
    const res = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Upload failed (${res.status}): ${errorText || "Unknown server error"}`,
      );
    }

    const data = await res.json();
    if (!data?.url) {
      throw new Error("Upload succeeded but no image URL returned.");
    }
    return data.url;
  };

  const addImages = async (uris: string[]) => {
    const remaining = maxImages - images.length;
    const toAdd = uris.slice(0, remaining);

    if (toAdd.length === 0) {
      Alert.alert("Limit reached", `Max ${maxImages} images allowed.`);
      return;
    }

    const startIndex = images.length;
    setImages((prev) => [
      ...prev,
      ...toAdd.map((uri) => ({ uri, uploading: true })),
    ]);

    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        toAdd.map((uri) => uploadImage(uri)),
      );

      setImages((prev) =>
        prev.map((item, index) => {
          if (index < startIndex || index >= startIndex + toAdd.length) {
            return item;
          }
          const url = uploadedUrls[index - startIndex];
          return { ...item, url, uploading: false };
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Upload failed", message);
      setImages((prev) => prev.filter((_, index) => index < startIndex));
    } finally {
      setUploading(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow photo access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
      });

      if (!result.canceled) {
        await addImages(result.assets.map((asset) => asset.uri));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        await addImages(result.assets.map((asset) => asset.uri));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePublish = async () => {
    try {
      if (!sellerId) {
        Alert.alert("Missing seller", "Please sign in again.");
        return;
      }

      if (uploading || images.some((image) => image.uploading)) {
        Alert.alert("Uploading", "Please wait for images to finish uploading.");
        return;
      }

      const payload = {
        seller: sellerId,
        name,
        description,
        category,
        price,
        stock,
        variants: [{ size, stock }],
        imgUrls: images.map((image) => image.url).filter(Boolean),
      };
      const res = await api.post("/product/createProduct", payload);

      if (res.status === 201) {
        Alert.alert("Product Added successfully");
        clearFields();
        router.push("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-2 items-center">
          <Text className="text-2xl font-bold text-slate-900">
            Add New Product
          </Text>
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-base font-semibold text-slate-900">
            Product Details
          </Text>

          <View className="mt-4">
            <Text className="mb-2 text-xs font-medium text-slate-500">
              Product Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name of the product.."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
            />
          </View>

          <View className="mt-4">
            <Text className="mb-2 text-xs font-medium text-slate-500">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description of the product..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 min-h-[120px]"
            />
          </View>
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-base font-semibold text-slate-900">
            Pricing & Stock
          </Text>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-xs font-medium text-slate-500">
                Price
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="Price..."
                keyboardType="number-pad"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-xs font-medium text-slate-500">
                Stock
              </Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                placeholder="Add stock..."
                keyboardType="number-pad"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
              />
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-xs font-medium text-slate-500">
                Size
              </Text>
              <Pressable
                onPress={() => setShowSizeOptions((prev) => !prev)}
                className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <Text
                  className={`text-base ${size ? "text-slate-900" : "text-slate-400"}`}
                >
                  {size || "Select size"}
                </Text>
                <Ionicons
                  name={showSizeOptions ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#94a3b8"
                />
              </Pressable>
              {showSizeOptions && (
                <View className="mt-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {sizeOptions.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setSize(option);
                        setShowSizeOptions(false);
                      }}
                      className="px-4 py-3 border-b border-slate-100 last:border-b-0"
                    >
                      <Text className="text-base text-slate-900">{option}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-3xl bg-white py-5 px-5 shadow-sm">
          <Text className="text-base font-semibold text-slate-900">
            Product Images
          </Text>
          <Text className="mt-1 text-xs text-slate-500">
            Upload clear images to improve sales.
          </Text>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={takePhoto}
              className="flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6"
            >
              <Ionicons name="image-outline" size={24} color="#64748b" />
              <Text className="mt-2 text-xs font-medium text-slate-500 text-center">
                Capture Image
              </Text>
            </Pressable>
            <Pressable
              onPress={pickFromGallery}
              className="flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6"
            >
              <Ionicons name="images-outline" size={24} color="#64748b" />
              <Text className="mt-2 text-xs font-medium text-slate-500 text-center">
                Add from gallery
              </Text>
            </Pressable>
          </View>

          {images.length > 0 && (
            <View className="mt-4 flex-row flex-wrap gap-3">
              {images.map((image, index) => (
                <View
                  key={`${image.uri}-${index}`}
                  className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200"
                >
                  <Image
                    source={{ uri: image.uri }}
                    className="h-full w-full"
                  />
                  {image.uploading && (
                    <View className="absolute inset-0 items-center justify-center bg-black/30">
                      <Text className="text-xs font-semibold text-white">
                        Uploading...
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mt-6 flex-row gap-3">
          <Pressable className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <Text className="text-center text-base font-semibold text-slate-900">
              Save Draft
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 rounded-2xl bg-slate-900 px-4 py-4"
            onPress={handlePublish}
          >
            <Text className="text-center text-base font-semibold text-white">
              Publish
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
