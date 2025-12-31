import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@theme/useTheme";
import { useAppStore } from "@store/useAppStore";

export function SettingsScreen() {
  const { theme } = useTheme();
  const {
    settings,
    setDarkMode,
    toggleLanguage,
    setSaveAttemptPhotos,
    clearAttemptHistory,
  } = useAppStore();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Preferencias</Text>

        <Section title="Apariencia" color={theme.text}>
          <Row
            label="Modo oscuro"
            right={<Switch value={settings.darkMode} onValueChange={setDarkMode} />}
            color={theme.text}
          />
        </Section>

        <Section title="Idioma" color={theme.text}>
          <View style={styles.row}>
            <Pressable
              onPress={toggleLanguage}
              style={[styles.pill, { borderColor: theme.text + "22" }]}
            >
              <Text style={{ color: theme.text }}>
                {settings.language === "es" ? "Español (tocar para inglés)" : "English (tap for español)"}
              </Text>
            </Pressable>
          </View>
        </Section>

        <Section title="Privacidad" color={theme.text}>
          <Row
            label="Guardar fotos de intentos"
            right={<Switch value={settings.saveAttemptPhotos} onValueChange={setSaveAttemptPhotos} />}
            color={theme.text}
            helper="Predeterminado: apagado"
          />
          <Pressable
            onPress={clearAttemptHistory}
            style={[styles.secondaryBtn, { borderColor: theme.text + "22" }]}
          >
            <Text style={{ color: theme.text }}>Borrar historial de intentos</Text>
          </Pressable>
        </Section>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  label,
  right,
  helper,
  color,
}: {
  label: string;
  right: React.ReactNode;
  helper?: string;
  color: string;
}) {
  return (
    <View style={styles.rowBlock}>
      <View style={{ flex: 1 }}>
        <Text style={{ color }}>{label}</Text>
        {helper ? <Text style={{ color: color + "99" }}>{helper}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  section: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    borderColor: "#e5e7eb33",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rowBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
});
