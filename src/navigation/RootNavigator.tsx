import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";
import { LocksListScreen } from "@screens/LocksListScreen";
import { LockDetailScreen } from "@screens/LockDetailScreen";
import { UnlockScreen } from "@screens/UnlockScreen";
import { AddReferencePhotosScreen } from "@screens/AddReferencePhotosScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="LocksList" component={LocksListScreen} options={{ title: "Locks" }} />
        <Stack.Screen name="LockDetail" component={LockDetailScreen} options={{ title: "Lock" }} />
        <Stack.Screen name="Unlock" component={UnlockScreen} options={{ title: "Unlock" }} />
        <Stack.Screen
          name="AddReferencePhotos"
          component={AddReferencePhotosScreen}
          options={{ title: "Reference photos" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
