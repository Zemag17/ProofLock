import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, View, useColorScheme } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { CameraPreview } from "@components/CameraPreview";
import { useLocksStore } from "@store/useLocksStore";
import { palette } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { RootStackParamList } from "@navigation/types";

export function UnlockScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Unlock">>();
  const scheme = useColorScheme();
  const colors = palette[scheme === "dark" ? "dark" : "light"];
  const { lockId } = route.params;
  const { locks, attemptUnlock } = useLocksStore();
  const lock = locks.find((l) => l.id === lockId);
  const [status, setStatus] = useState<string | null>(null);
  const [duration, setDuration] = useState("30");

  if (!lock) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background, padding: spacing.xl }]}> 
        <Text style={{ color: colors.text }}>Lock not found.</Text>
      </SafeAreaView>
    );
  }

  const handleCapture = async (uri: string) => {
    setStatus("Processing...");
    const durationMinutes = Number(duration) || 30;
    const { result, session } = await attemptUnlock(lockId, uri, durationMinutes);

    if (!result.matched) {
      setStatus(`Denied. Score: ${Math.round(result.score * 100)}%. ${result.reason ?? "Try again"}`);
      return;
    }

    setStatus(`Unlocked for ${durationMinutes}m until ${session?.expiresAt ?? "N/A"}`);
    Alert.alert("Unlocked", "Access granted via live photo.");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Unlock {lock.name}</Text>
        <Text style={{ color: colors.muted, marginBottom: spacing.md }}>
          Live camera is mandatory. Gallery uploads are disabled during unlock attempts.
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Session duration (minutes)</Text>
        <TextInput
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="30"
          placeholderTextColor={colors.muted}
        />

        <CameraPreview onCapture={handleCapture} />

        {status && <Text style={{ color: colors.text, marginTop: spacing.sm }}>{status}</Text>}
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
  label: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
});
