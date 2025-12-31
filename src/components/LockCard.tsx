import React from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Lock } from "@types/domain";
import { palette } from "@theme/colors";
import { spacing } from "@theme/spacing";

interface Props {
  lock: Lock;
  onPress?: () => void;
}

export function LockCard({ lock, onPress }: Props) {
  const scheme = useColorScheme();
  const colors = palette[scheme === "dark" ? "dark" : "light"];

  const daySummary = lock.schedule?.days?.join(", ") ?? "Always";
  const targetLabel = lock.targetType === "app" ? "App" : "Web";

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: colors.text }]}>{lock.name}</Text>
        <View style={[styles.pill, { backgroundColor: colors.primary }]}> 
          <Text style={styles.pillText}>{targetLabel}</Text>
        </View>
      </View>
      <Text style={[styles.sub, { color: colors.muted }]}>Target: {lock.targetValue}</Text>
      <Text style={[styles.sub, { color: colors.muted }]}>Schedule: {daySummary}</Text>
      <Text style={[styles.sub, { color: colors.muted }]}>Refs: {lock.referencePhotos.length}/5</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 12,
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  sub: {
    fontSize: 14,
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    color: "#0b1220",
    fontWeight: "700",
    fontSize: 12,
  },
});
