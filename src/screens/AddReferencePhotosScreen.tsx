import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View, useColorScheme } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ReferencePhotoList } from "@components/ReferencePhotoList";
import { useLocksStore } from "@store/useLocksStore";
import { palette } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { RootStackParamList } from "@navigation/types";

export function AddReferencePhotosScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "AddReferencePhotos">>();
  const scheme = useColorScheme();
  const colors = palette[scheme === "dark" ? "dark" : "light"];
  const { lockId } = route.params;
  const { locks, addReferencePhoto } = useLocksStore();
  const lock = locks.find((l) => l.id === lockId);
  const [uploading, setUploading] = useState(false);

  if (!lock) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background, padding: spacing.xl }]}> 
        <Text style={{ color: colors.text }}>Lock not found.</Text>
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    if (lock.referencePhotos.length >= 5) {
      Alert.alert("Limit reached", "You can add up to 5 reference photos.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Enable photo library to add reference images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (result.canceled || !result.assets?.[0]?.uri) return;

    setUploading(true);
    try {
      await addReferencePhoto(lockId, result.assets[0].uri);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Reference library</Text>
        <Text style={{ color: colors.muted, marginBottom: spacing.md }}>
          Gallery uploads are allowed here to set your reference photos.
        </Text>

        <ReferencePhotoList photos={lock.referencePhotos} />

        <Pressable
          onPress={pickImage}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.primaryText}>{uploading ? "Uploading..." : "Add from gallery"}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.secondaryBtn}>
          <Text style={{ color: colors.muted }}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: spacing.xl,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.md,
  },
  primaryText: {
    color: "#0b1220",
    fontWeight: "700",
  },
  secondaryBtn: {
    alignItems: "center",
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
});
