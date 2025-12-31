import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@theme/useTheme";
import { Card } from "@components/Card";
import { Chip } from "@components/Chip";
import { FAB } from "@components/FAB";
import { RootStackParamList } from "@app/types";
import { VisionThreshold } from "@services/VisionMatchService";
import { useAppStore } from "@store/useAppStore";

type TargetType = "apps" | "web";
type WizardStep = 1 | 2 | 3;

type ReferencePhotoDraft = { id: string; uri: string; label: string };

const APP_TARGETS = ["Instagram", "YouTube", "TikTok", "Reddit", "X"];
const WEB_TARGETS = ["instagram.com", "youtube.com", "reddit.com", "twitter.com", "netflix.com"];
const DURATIONS = [5, 15, 30, 60];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function LockWizardScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const addLockFromDraft = useAppStore((s) => s.addLockFromDraft);
  const userId = useAppStore((s) => s.user.id);

  const [step, setStep] = useState<WizardStep>(1);
  const [targetType, setTargetType] = useState<TargetType | null>(null);
  const [targets, setTargets] = useState<string[]>([]);
  const [title, setTitle] = useState("");

  const [photos, setPhotos] = useState<ReferencePhotoDraft[]>([]);

  const [duration, setDuration] = useState<number>(30);
  const [sensitivity, setSensitivity] = useState<VisionThreshold>("med");
  const [savePhotos, setSavePhotos] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5]);
  // keep draft stable across steps (state already lives here)

  const autoTitle = useMemo(() => {
    if (!targetType || targets.length === 0) return "Nuevo bloqueo";
    const prefix = targetType === "apps" ? "Apps" : "Web";
    return `${prefix}: ${targets[0]}`;
  }, [targetType, targets]);

  useEffect(() => {
    if (!title) {
      setTitle(autoTitle);
    }
  }, [autoTitle, title]);

  const toggleTarget = (value: string) => {
    setTargets((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const pickFromGallery = async () => {
    if (photos.length >= 5) {
      Alert.alert("Límite", "Puedes agregar hasta 5 fotos de referencia.");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Activa el acceso a la galería para cargar referencias.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const uri = result.assets[0].uri;
    setPhotos((prev) => [...prev, { id: `photo-${Date.now()}`, uri, label: "Referencia" }]);
  };

  const addFromCamera = async () => {
    // TODO: integrate Expo Camera for config-time capture
    if (photos.length >= 5) {
      Alert.alert("Límite", "Puedes agregar hasta 5 fotos de referencia.");
      return;
    }
    const fakeUri = `capture://${Date.now()}`;
    setPhotos((prev) => [...prev, { id: `photo-${Date.now()}`, uri: fakeUri, label: "Live" }]);
  };

  const toggleDay = (index: number) => {
    setScheduleDays((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort((a, b) => a - b)
    );
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!targetType) return "Selecciona apps o web";
      if (targets.length === 0) return "Elige al menos un objetivo";
      return null;
    }
    if (step === 2) {
      if (photos.length === 0) return "Agrega al menos una foto de referencia";
      return null;
    }
    if (step === 3) {
      if (!DURATIONS.includes(duration)) return "Selecciona una duración";
      if (!["low", "med", "high"].includes(sensitivity)) return "Selecciona sensibilidad";
      if (scheduleDays.length === 0) return "Selecciona al menos un día";
      return null;
    }
    return null;
  };

  const next = () => {
    const error = validateStep();
    if (error) {
      Alert.alert("Revisa", error);
      return;
    }
    setStep((prev) => (prev < 3 ? ((prev + 1) as WizardStep) : prev));
  };

  const back = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  };

  const validateAll = (): string | null => {
    const step1Error = targetType ? (targets.length ? null : "Elige al menos un objetivo") : "Selecciona apps o web";
    if (step1Error) return step1Error;
    if (photos.length === 0) return "Agrega al menos una foto de referencia";
    if (!DURATIONS.includes(duration)) return "Selecciona una duración";
    if (!["low", "med", "high"].includes(sensitivity)) return "Selecciona sensibilidad";
    if (scheduleDays.length === 0) return "Selecciona al menos un día";
    return null;
  };

  const finish = () => {
    const error = validateAll();
    if (error) {
      Alert.alert("Revisa", error);
      return;
    }

    const draft = {
      title: title || autoTitle || "Nuevo bloqueo",
      type: targetType!,
      targets,
      referencePhotoIds: photos.map((p) => p.id),
      threshold: sensitivity,
      durationMinutes: duration,
      schedule: { days: scheduleDays },
      saveAttemptPhotos: savePhotos,
    } as const;

    addLockFromDraft(draft);
    navigation.navigate("Home");
  };

  const renderStep = () => {
    if (step === 1) {
      const options = targetType === "web" ? WEB_TARGETS : APP_TARGETS;
      return (
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Objetivos</Text>
          <View style={styles.row}>
            <Chip label="Apps" />
            <Pressable onPress={() => setTargetType("apps")}> 
              <Text style={{ color: targetType === "apps" ? theme.primary : theme.text }}>Seleccionar apps</Text>
            </Pressable>
            <Pressable onPress={() => setTargetType("web")}> 
              <Text style={{ color: targetType === "web" ? theme.primary : theme.text }}>Seleccionar web</Text>
            </Pressable>
          </View>
          <TextInput
            placeholder="Título"
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { borderColor: theme.text + "22", color: theme.text }]}
            placeholderTextColor={theme.text + "55"}
          />
          <View style={styles.chipsWrap}>
            {options.map((t) => (
              <Pressable key={t} onPress={() => toggleTarget(t)}>
                <Chip label={targets.includes(t) ? `✓ ${t}` : t} />
              </Pressable>
            ))}
          </View>
        </Card>
      );
    }

    if (step === 2) {
      return (
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Fotos de referencia</Text>
          <Text style={{ color: theme.text + "99", marginBottom: 8 }}>
            Configuración solamente: puedes usar cámara o galería. Máx 5 fotos.
          </Text>
          <View style={styles.row}>
            <Pressable onPress={addFromCamera} style={[styles.secondaryBtn, { borderColor: theme.text + "22" }]}> 
              <Text style={{ color: theme.text }}>Agregar con cámara</Text>
            </Pressable>
            <Pressable onPress={pickFromGallery} style={[styles.secondaryBtn, { borderColor: theme.text + "22" }]}> 
              <Text style={{ color: theme.text }}>Agregar desde galería</Text>
            </Pressable>
          </View>
          <View style={{ gap: 8, marginTop: 12 }}>
            {photos.map((p) => (
              <View key={p.id} style={[styles.photoRow, { borderColor: theme.text + "22" }]}> 
                <Text style={{ color: theme.text }}>{p.label}</Text>
                <Text style={{ color: theme.text + "66" }} numberOfLines={1}>
                  {p.uri}
                </Text>
                <Pressable onPress={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}>
                  <Text style={{ color: theme.primary }}>Eliminar</Text>
                </Pressable>
              </View>
            ))}
            {photos.length === 0 && (
              <Text style={{ color: theme.text + "66" }}>Aún no hay fotos.</Text>
            )}
          </View>
        </Card>
      );
    }

    return (
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Parámetros</Text>
        <Text style={[styles.label, { color: theme.text }]}>Duración (min)</Text>
        <View style={styles.chipsWrap}>
          {DURATIONS.map((d) => (
            <Pressable key={d} onPress={() => setDuration(d)}>
              <Chip label={duration === d ? `✓ ${d}` : `${d}`} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Sensibilidad</Text>
        <View style={styles.chipsWrap}>
          {["low", "med", "high"].map((s) => (
            <Pressable key={s} onPress={() => setSensitivity(s as VisionThreshold)}>
              <Chip label={sensitivity === s ? `✓ ${s}` : `${s}`} />
            </Pressable>
          ))}
        </View>

        <View style={styles.toggleRow}>
          <Text style={{ color: theme.text }}>Guardar fotos de intentos</Text>
          <Switch value={savePhotos} onValueChange={setSavePhotos} />
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Repetir días</Text>
        <View style={styles.chipsWrap}>
          {DAYS.map((d, idx) => (
            <Pressable key={d} onPress={() => toggleDay(idx + 1)}>
              <Chip label={scheduleDays.includes(idx + 1) ? `✓ ${d}` : d} />
            </Pressable>
          ))}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Nuevo bloqueo</Text>
        <Text style={{ color: theme.text + "99", marginBottom: 12 }}>3 pasos. Guarda el borrador si necesitas salir.</Text>

        <View style={styles.stepper}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.dot, { backgroundColor: step === s ? theme.primary : theme.text + "22" }]} />
          ))}
        </View>

        {renderStep()}

        <View style={styles.navRow}>
          <Pressable onPress={back} disabled={step === 1} style={[styles.secondaryBtn, { borderColor: theme.text + "22" }]}> 
            <Text style={{ color: step === 1 ? theme.text + "55" : theme.text }}>Atrás</Text>
          </Pressable>
          {step < 3 ? (
            <Pressable onPress={next} style={[styles.primaryBtn, { backgroundColor: theme.primary }]}> 
              <Text style={styles.primaryText}>Siguiente</Text>
            </Pressable>
          ) : (
            <Pressable onPress={finish} style={[styles.primaryBtn, { backgroundColor: theme.primary }]}> 
              <Text style={styles.primaryText}>Guardar</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      <FAB label="Guardar borrador" onPress={finish} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  photoRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  stepper: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#0b1220",
    fontWeight: "700",
  },
});
