import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { ReferencePhoto } from "@types/domain";
import { palette } from "@theme/colors";
import { spacing } from "@theme/spacing";

interface Props {
  photos: ReferencePhoto[];
  onAdd?: () => void;
}

export function ReferencePhotoList({ photos, onAdd }: Props) {
  const scheme = useColorScheme();
  const colors = palette[scheme === "dark" ? "dark" : "light"];

  return (
    <View style={{ marginVertical: spacing.md }}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Reference photos</Text>
        {onAdd ? (
          <Pressable
            onPress={onAdd}
            style={[styles.addButton, { borderColor: colors.primary, backgroundColor: colors.surface }]}
          >
            <Text style={[styles.addText, { color: colors.primary }]}>Add</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {photos.map((photo) => (
          <Image
            key={photo.id}
            source={{ uri: photo.uri }}
            style={[styles.thumbnail, { borderColor: colors.border }]}
          />
        ))}
        {photos.length === 0 && (
          <View style={[styles.placeholder, { borderColor: colors.border }]}> 
            <Text style={{ color: colors.muted }}>No photos yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  addText: {
    fontWeight: "700",
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  placeholder: {
    width: 120,
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
