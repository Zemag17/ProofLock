import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ReferencePhotoList } from "@components/ReferencePhotoList";
import { useLocksStore } from "@store/useLocksStore";
import { palette } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { RootStackParamList } from "@navigation/types";

export function LockDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "LockDetail">>();
  const scheme = useColorScheme();
  const colors = palette[scheme === "dark" ? "dark" : "light"];
  const { lockId } = route.params;

  const lock = useLocksStore((state) => state.locks.find((l) => l.id === lockId));

  if (!lock) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background, padding: spacing.xl }]}> 
        <Text style={{ color: colors.text }}>Lock not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>{lock.name}</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>Target: {lock.targetValue}</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>Active days: {lock.schedule?.days.join(", ") ?? "Always"}</Text>

        <ReferencePhotoList
          photos={lock.referencePhotos}
          onAdd={() => navigation.navigate("AddReferencePhotos", { lockId })}
        />

        <View style={styles.actions}>
          <Pressable
            onPress={() => navigation.navigate("AddReferencePhotos", { lockId })}
            style={[styles.secondaryBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.secondaryText, { color: colors.primary }]}>Configure refs</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Unlock", { lockId })}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.primaryText}>Unlock</Text>
          </Pressable>
        </View>
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
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    alignItems: "center",
  },
  secondaryText: {
    fontWeight: "700",
  },
  primaryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  primaryText: {
    color: "#0b1220",
    fontWeight: "700",
  },
});
