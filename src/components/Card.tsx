import React, { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@theme/useTheme";

export function Card({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.text + "22" }]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
});
