import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@theme/useTheme";

interface FABProps {
  label: string;
  onPress?: () => void;
}

export function FAB({ label, onPress }: FABProps) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.fab, { backgroundColor: theme.primary }]}> 
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: {
    color: "#0b1220",
    fontWeight: "700",
  },
});import React from "react";
import { Pressable, Text } from "react-native";

interface FABProps {
  label: string;
  onPress?: () => void;
}

export function FAB({ label, onPress }: FABProps) {
  return (
    <Pressable onPress={onPress}>
      <Text>{label}</Text>
    </Pressable>
  );
}
