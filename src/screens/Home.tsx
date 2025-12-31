import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card } from "@components/Card";
import { Chip } from "@components/Chip";
import { FAB } from "@components/FAB";
import { useTheme } from "@theme/useTheme";
import { useAppStore } from "@store/useAppStore";
import { isWithinSchedule } from "@services/schedule";
import { RootStackParamList } from "@app/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user, categories, locks, toggleLock, revokeSession } = useAppStore();
  const primaryLockId = locks[0]?.id;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Hola, {user.name}</Text>
            <Text style={{ color: theme.text + "99" }}>Mantén tus apps bloqueadas hasta cumplir.</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("Settings")}> 
            <Text style={{ color: theme.primary, fontWeight: "700" }}>Ajustes</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {categories.map((cat) => (
            <Chip key={cat} label={cat} />
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Bloqueos activos</Text>
        {locks.map((lock) => (
          <Card key={lock.id}>
            {(() => {
              const now = new Date();
              const activeBySchedule = lock.schedule ? isWithinSchedule(lock.schedule, now) : true;
              const blockingNow = lock.enabled && activeBySchedule;
              const statusText = !lock.enabled
                ? "Pausado"
                : blockingNow
                ? "Activo"
                : "Inactive by schedule";
              const statusColor = blockingNow ? theme.primary : theme.text + "66";

              return (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ color: theme.text + "99" }}>{lock.category}</Text>
                  <Text style={{ color: statusColor }}>{statusText}</Text>
                </View>
              );
            })()}
            <View style={styles.lockRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lockTitle, { color: theme.text }]}>{lock.name}</Text>
                <Text style={{ color: theme.text + "99", marginTop: 6 }}>
                  Días: {lock.scheduleDays.join(", ")}
                </Text>
              </View>
              {lock.hasActiveSession ? (
                <View style={[styles.badge, { backgroundColor: theme.primary + "33" }]}> 
                  <Text style={[styles.badgeText, { color: theme.primary }]}>Sesión activa</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => toggleLock(lock.id)}
                style={[styles.secondaryButton, { borderColor: theme.text + "22", flex: 1 }]}
              >
                <Text style={{ color: theme.text }}>{lock.enabled ? "Desactivar" : "Activar"}</Text>
              </Pressable>
              {lock.hasActiveSession && (
                <Pressable
                  onPress={() => revokeSession(lock.id)}
                  style={[styles.secondaryButton, { borderColor: theme.text + "22", flex: 1 }]}
                >
                  <Text style={{ color: theme.text }}>Revocar sesión</Text>
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => navigation.navigate("Blocked", { lockId: lock.id })}
              style={[styles.secondaryButton, { borderColor: theme.text + "22" }]}
            >
              <Text style={{ color: theme.text }}>Ver bloqueo</Text>
            </Pressable>
          </Card>
        ))}

        <View style={styles.linksRow}>
          <NavLink
            label="Desbloquear"
            onPress={() => {
              if (primaryLockId) navigation.navigate("CameraUnlock", { lockId: primaryLockId });
            }}
            color={theme.primary}
          />
          <NavLink
            label="Fotos de referencia"
            onPress={() => {
              if (primaryLockId) navigation.navigate("ReferencePhotos", { lockId: primaryLockId });
            }}
            color={theme.text}
          />
          <NavLink
            label="Resultados"
            onPress={() => {
              if (primaryLockId)
                navigation.navigate("Result", {
                  lockId: primaryLockId,
                  score: 0.82,
                  threshold: "med",
                  success: true,
                  durationMinutes: 30,
                });
            }}
            color={theme.text}
          />
        </View>
      </ScrollView>

      <FAB onPress={() => navigation.navigate("LockWizard")} label="Nuevo bloqueo" />
    </SafeAreaView>
  );
}

function NavLink({ label, onPress, color }: { label: string; onPress: () => void; color: string }) {
  return (
    <Pressable onPress={onPress} style={styles.navLink}>
      <Text style={{ color }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
  },
  categories: {
    flexGrow: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  linksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  navLink: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
