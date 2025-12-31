import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { LockCard } from "@components/LockCard";
import { useLocksStore } from "@store/useLocksStore";
import { palette } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { RootStackParamList } from "@navigation/types";

export function LocksListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scheme = useColorScheme();
  const colors = palette[scheme === "dark" ? "dark" : "light"];
  const { locks, loadLocks, createLock } = useLocksStore();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadLocks();
  }, [loadLocks]);

  const handleCreateMock = async () => {
    if (creating) return;
    setCreating(true);
    try {
      await createLock({
        name: `Lock ${locks.length + 1}`,
        targetType: "web",
        targetValue: "example.com",
        schedule: { days: ["mon", "tue", "wed", "thu", "fri"] },
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>ProofLock</Text>
            <Text style={{ color: colors.muted }}>Live-photo gated unlocks</Text>
          </View>
          <Pressable onPress={handleCreateMock} style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.addText}>{creating ? "Adding..." : "Add"}</Text>
          </Pressable>
        </View>
        {locks.map((lock) => (
          <LockCard
            key={lock.id}
            lock={lock}
            onPress={() => navigation.navigate("LockDetail", { lockId: lock.id })}
          />
        ))}
        {locks.length === 0 && (
          <Text style={{ color: colors.muted, marginTop: spacing.xl }}>
            No locks yet. Add one to start protecting targets.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  addButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  addText: {
    color: "#0b1220",
    fontWeight: "700",
  },
});
