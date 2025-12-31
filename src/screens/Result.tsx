import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "@theme/useTheme";
import { RootStackParamList } from "@app/types";
import { logAttempt } from "@services/attempts.service";
import { createUnlockSession } from "@services/sessions.service";
import { useAppStore } from "@store/useAppStore";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

export function ResultScreen({ navigation, route }: Props) {
  const { lockId, score, threshold, success, durationMinutes } = route.params;
  const { theme } = useTheme();
  const { user, settings } = useAppStore();

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const didLogAttempt = useRef(false);
  const didCreateSession = useRef(false);

  const statusText = success
    ? `Desbloqueado por ${durationMinutes} minutos`
    : "No coincidió esta vez";

  const closeToThreshold = useMemo(() => {
    const thresholds: Record<string, number> = { low: 0.7, med: 0.8, high: 0.88 };
    const t = thresholds[threshold];
    return score >= t - 0.05 && score < t;
  }, [score, threshold]);

  useEffect(() => {
    if (didLogAttempt.current) return;
    didLogAttempt.current = true;

    const saveImage = settings.saveAttemptPhotos;
    const capturedImageUrl = saveImage ? null : null; // TODO: upload to storage when enabled

    const run = async () => {
      await logAttempt({
        lockId,
        userId: user.id,
        status: success ? "success" : "fail",
        score,
        reason: success ? null : "Vision match below threshold",
        capturedImageUrl,
      });

      if (success && !didCreateSession.current) {
        didCreateSession.current = true;
        const expiresAt = new Date(Date.now() + durationMinutes * 60_000).toISOString();
        const session = await createUnlockSession({ lockId, userId: user.id, expiresAt });
        const expiration = new Date(session.expires_at).getTime();
        setRemainingSeconds(Math.max(0, Math.floor((expiration - Date.now()) / 1000)));
      }
    };

    run().catch((err) => {
      console.warn("Result handling failed", err);
    });
  }, [durationMinutes, lockId, score, settings.saveAttemptPhotos, success, threshold, user.id]);

  useEffect(() => {
    if (remainingSeconds === null) return;
    const id = setInterval(() => {
      setRemainingSeconds((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [remainingSeconds]);

  const goNow = () => navigation.navigate("Home");

  const remainingLabel = remainingSeconds !== null
    ? `${Math.floor(remainingSeconds / 60)}:${`${remainingSeconds % 60}`.padStart(2, "0")} restantes`
    : undefined;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>{statusText}</Text>
        <Text style={{ color: theme.text + "99", marginBottom: 12 }}>
          Puntaje: {(score * 100).toFixed(1)}% — Umbral: {threshold}
        </Text>

        {success ? (
          <View style={styles.block}>
            {remainingLabel && <Text style={{ color: theme.text }}>{remainingLabel}</Text>}
            <Text style={{ color: theme.text + "99" }}>
              Usa tu ventana de desbloqueo ahora para evitar repetir la prueba.
            </Text>
            <Pressable onPress={goNow} style={[styles.cta, { backgroundColor: theme.primary }]}> 
              <Text style={styles.ctaText}>Ir ahora</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.block}>
            <Text style={[styles.subtitle, { color: theme.text }]}>Consejos rápidos</Text>
            <Text style={{ color: theme.text + "99" }}>• Más luz</Text>
            <Text style={{ color: theme.text + "99" }}>• Acércate un poco</Text>
            <Text style={{ color: theme.text + "99" }}>• Ajusta el ángulo</Text>
            {closeToThreshold && (
              <Text style={{ color: theme.text, marginTop: 10 }}>Casi lo logras, inténtalo de nuevo.</Text>
            )}
            <Pressable onPress={() => navigation.navigate("CameraUnlock", { lockId })} style={[styles.cta, { backgroundColor: theme.primary }]}> 
              <Text style={styles.ctaText}>Intentar de nuevo</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  block: {
    gap: 6,
    marginTop: 10,
  },
  cta: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaText: {
    color: "#0b1220",
    fontWeight: "700",
  },
});
