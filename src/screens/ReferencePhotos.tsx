import React, { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@theme/useTheme";
import { useAppStore, ReferencePhoto } from "@store/useAppStore";
import { storageService } from "@services/storage";

type EditablePhoto = ReferencePhoto;

export function ReferencePhotosScreen() {
  const { theme } = useTheme();
  const { referencePhotos, addReferencePhoto, updateReferencePhoto, deleteReferencePhoto } = useAppStore();
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, EditablePhoto[]> = {};
    referencePhotos.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [referencePhotos]);

  const pickImage = async (fromCamera: boolean) => {
    if (!label || !category) {
      Alert.alert("Falta info", "Agrega etiqueta y categoría antes de subir.");
      return;
    }
    if (referencePhotos.length >= 5) {
      Alert.alert("Límite", "Máximo 5 fotos de referencia.");
      return;
    }

    const perms = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perms.granted) {
      Alert.alert("Permiso requerido", "Habilita acceso para continuar.");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (result.canceled || !result.assets?.[0]?.uri) return;
    const uri = result.assets[0].uri;
    addReferencePhoto({ uri, label, category });
    setLabel("");
  };

  const handleDelete = async (id: string, image_path: string) => {
    deleteReferencePhoto(id);
    if (editingId === id) {
      setEditingId(null);
      setLabel("");
      setCategory("");
    }
    await storageService.remove(image_path);
  };

  const startEdit = (photo: EditablePhoto) => {
    setEditingId(photo.id);
    setLabel(photo.label);
    setCategory(photo.category);
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!label || !category) {
      Alert.alert("Falta info", "Etiqueta y categoría son requeridas.");
      return;
    }
    updateReferencePhoto(editingId, { label, category });
    setEditingId(null);
    setLabel("");
    setCategory("");
  };

  const renderTile = ({ item }: { item: EditablePhoto }) => (
    <View style={[styles.tile, { borderColor: theme.text + "22" }]}> 
      <Text style={{ color: theme.text, fontWeight: "700" }}>{item.label}</Text>
      <Text style={{ color: theme.text + "99" }}>{item.category}</Text>
      <Text style={{ color: theme.text + "55" }} numberOfLines={1}>
        {item.image_path}
      </Text>
      <Pressable onPress={() => startEdit(item)}>
        <Text style={{ color: theme.primary }}>Editar</Text>
      </Pressable>
      <Pressable onPress={() => handleDelete(item.id, item.image_path)}>
        <Text style={{ color: "#f43f5e" }}>Eliminar</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Fotos de referencia</Text>
        <Text style={{ color: theme.text + "99", marginBottom: 10 }}>
          Agrupa por categoría y mantén tus pruebas ordenadas.
        </Text>

        <View style={[styles.inputRow, { borderColor: theme.text + "22" }]}> 
          <TextInput
            placeholder="Etiqueta"
            value={label}
            onChangeText={setLabel}
            style={[styles.input, { color: theme.text }]}
            placeholderTextColor={theme.text + "55"}
          />
          <TextInput
            placeholder="Categoría"
            value={category}
            onChangeText={setCategory}
            style={[styles.input, { color: theme.text }]}
            placeholderTextColor={theme.text + "55"}
          />
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={() => pickImage(true)} style={[styles.secondaryBtn, { borderColor: theme.text + "22" }]}> 
            <Text style={{ color: theme.text }}>{editingId ? "Reemplazar con cámara" : "Cámara"}</Text>
          </Pressable>
          <Pressable onPress={() => pickImage(false)} style={[styles.secondaryBtn, { borderColor: theme.text + "22" }]}> 
            <Text style={{ color: theme.text }}>{editingId ? "Reemplazar con galería" : "Galería"}</Text>
          </Pressable>
        </View>

        {editingId ? (
          <Pressable onPress={saveEdit} style={[styles.primaryBtn, { backgroundColor: theme.primary }]}> 
            <Text style={styles.primaryText}>Guardar cambios</Text>
          </Pressable>
        ) : null}

        <FlatList
          data={Object.entries(grouped).flatMap(([cat, items]) => [{ header: cat }, ...items])}
          keyExtractor={(item, index) => ("header" in item ? `h-${item.header}-${index}` : item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          renderItem={({ item }) =>
            "header" in item ? (
              <Text style={[styles.categoryHeader, { color: theme.text }]}>{item.header}</Text>
            ) : (
              renderTile({ item })
            )
          }
          ListEmptyComponent={<Text style={{ color: theme.text + "66" }}>Sin fotos todavía.</Text>}
        />
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
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  input: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#0b1220",
    fontWeight: "700",
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  tile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  categoryHeader: {
    width: "100%",
    fontWeight: "700",
    marginTop: 8,
  },
});
