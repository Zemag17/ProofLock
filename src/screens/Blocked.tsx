import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppStore } from "@store/useAppStore";
import { useTheme } from "@theme/useTheme";
import { isWithinSchedule } from "@services/schedule";
import { RootStackParamList } from "@app/types";

type Props = NativeStackScreenProps<RootStackParamList, "Blocked">;

export function BlockedScreen({ navigation, route }: Props) {
  const { lockId } = route.params;
  const { theme } = useTheme();
  const lock = useAppStore((s) => s.locks.find((l) => l.id === lockId));

  const now = new Date();
  const activeBySchedule = lock?.schedule ? isWithinSchedule(lock.schedule, now) : true;
  const blockingNow = Boolean(lock?.enabled) && activeBySchedule;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Acceso bloqueado</Text>
        {lock ? (
          <Text style={{ color: theme.text + "99", marginBottom: 8 }}>
            {lock.name} está protegiendo este objetivo.
          </Text>
        ) : (
          <Text style={{ color: theme.text + "99", marginBottom: 8 }}>Tienes un bloqueo activo.</Text>
        )}

        {lock && !activeBySchedule ? (
          <Text style={{ color: theme.text + "99", marginBottom: 20 }}>
            Fuera del horario programado. Este bloqueo no se aplica en este momento.
          </Text>
        ) : (
          <Text style={{ color: theme.text + "99", marginBottom: 20 }}>
            Para continuar, toma una foto en vivo del objetivo y validaremos en segundos.
          </Text>
        )}

        <Pressable
          disabled={!blockingNow}
          onPress={() => navigation.navigate("CameraUnlock", { lockId })}
          style={[
            styles.primaryBtn,
            { backgroundColor: blockingNow ? theme.primary : theme.text + "22" },
          ]}
        >
          <Text style={[styles.primaryText, { color: blockingNow ? "#0b1220" : theme.text + "66" }]}>Tomar foto para desbloquear</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} style={[styles.secondaryBtn, { borderColor: theme.text + "22" }]}> 
          <Text style={{ color: theme.text }}>Cancelar</Text>
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
    flex: 1,
    padding: 20,
    gap: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#0b1220",
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
});
