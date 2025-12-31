import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { palette } from "@theme/colors";
import { spacing } from "@theme/spacing";

interface Props {
  onCapture: (uri: string) => Promise<void> | void;
}

export function CameraPreview({ onCapture }: Props) {
  const scheme = useColorScheme();
  const colors = palette[scheme === "dark" ? "dark" : "light"];
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isTaking, setIsTaking] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isTaking) return;
    setIsTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, skipProcessing: true });
      if (photo?.uri) {
        await onCapture(photo.uri);
      }
    } finally {
      setIsTaking(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={[styles.permissionBox, { borderColor: colors.border }]}>
        <Text style={{ color: colors.text, marginBottom: spacing.sm }}>Camera access is required for live unlocks.</Text>
        <Pressable onPress={requestPermission} style={[styles.requestButton, { backgroundColor: colors.primary }]}> 
          <Text style={styles.requestText}>Grant camera access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={(ref) => (cameraRef.current = ref)}
        style={styles.camera}
        facing={CameraType.back}
        onCameraReady={() => setIsReady(true)}
      />
      <Pressable
        disabled={!isReady || isTaking}
        onPress={handleCapture}
        style={[styles.captureButton, { backgroundColor: colors.primary }]}
      >
        {isTaking ? <ActivityIndicator color="#0b1220" /> : <Text style={styles.captureText}>Capture live photo</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    borderRadius: 16,
    overflow: "hidden",
  },
  camera: {
    height: 320,
    width: "100%",
  },
  captureButton: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  captureText: {
    fontWeight: "700",
    color: "#0b1220",
  },
  permissionBox: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  requestButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  requestText: {
    color: "#0b1220",
    fontWeight: "700",
  },
});
