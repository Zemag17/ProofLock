// Live capture only: no pickers, no uploads, capture-once and discard.
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "@theme/useTheme";
import { IVisionMatchService, VisionThreshold } from "@services/VisionMatchService";
import { VisionMatchServiceStub } from "@services/VisionMatchServiceStub";
import { useAppStore } from "@store/useAppStore";
import { RootStackParamList } from "@app/types";

type Props = NativeStackScreenProps<RootStackParamList, "CameraUnlock">;

export function CameraUnlockScreen({ navigation, route }: Props) {
  const { lockId } = route.params;
  const { theme } = useTheme();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const referencePhotos = useAppStore((s) => s.referencePhotos);

  const visionService: IVisionMatchService = useMemo(() => new VisionMatchServiceStub(1234), []);
  const threshold: VisionThreshold = "med";

  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, skipProcessing: true, base64: false });
      const referenceUris = referencePhotos.map((p) => p.uri);
      const result = await visionService.compare(referenceUris, photo.uri, threshold);
      navigation.navigate("Result", {
        lockId,
        score: result.score,
        threshold: result.thresholdUsed,
        success: result.matched,
        durationMinutes: 30,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
        <View style={styles.permissionBox}>
          <Text style={[styles.title, { color: theme.text }]}>Se requiere cámara en vivo</Text>
          <Text style={{ color: theme.text + "99", marginVertical: 8 }}>
            Para desbloquear debes tomar una foto en vivo del objetivo. No se permite elegir desde la galería.
          </Text>
          <Pressable onPress={requestPermission} style={[styles.permissionBtn, { backgroundColor: theme.primary }]}> 
            <Text style={styles.permissionText}>Conceder acceso</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.flex}>
        <CameraView
          ref={(ref) => (cameraRef.current = ref)}
          style={styles.camera}
          facing={CameraType.back}
        />
        <View style={[styles.overlay, { backgroundColor: theme.background + "88" }]}> 
          <Text style={[styles.instruction, { color: theme.text }]}>Toma una foto en vivo del objetivo para desbloquear.</Text>
          <Pressable
            onPress={handleCapture}
            style={[styles.captureButton, { backgroundColor: loading ? theme.text + "44" : theme.primary }]}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#0b1220" /> : <Text style={styles.captureText}>Capturar</Text>}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 16,
  },
  instruction: {
    fontSize: 16,
    fontWeight: "600",
  },
  captureButton: {
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    minWidth: 160,
    alignItems: "center",
  },
  captureText: {
    color: "#0b1220",
    fontWeight: "700",
    fontSize: 16,
  },
  permissionBox: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  permissionBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  permissionText: {
    color: "#0b1220",
    fontWeight: "700",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});
