import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@theme/useTheme";

interface ChipProps {
  label: string;
}

export function Chip({ label }: ChipProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.text + "22" }]}>
      <Text style={[styles.text, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  text: {
    fontWeight: "600",
  },
});
