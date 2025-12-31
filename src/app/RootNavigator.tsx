import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@theme/useTheme";
import { RootStackParamList } from "./types";
import { HomeScreen } from "@screens/Home";
import { LockWizardScreen } from "@screens/LockWizard";
import { BlockedScreen } from "@screens/Blocked";
import { CameraUnlockScreen } from "@screens/CameraUnlock";
import { ResultScreen } from "@screens/Result";
import { SettingsScreen } from "@screens/Settings";
import { ReferencePhotosScreen } from "@screens/ReferencePhotos";
import { SignInScreen } from "@screens/SignIn";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isDark } = useTheme();

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
        <Stack.Screen name="LockWizard" component={LockWizardScreen} options={{ title: "Nuevo bloqueo" }} />
        <Stack.Screen name="Blocked" component={BlockedScreen} options={{ title: "Bloqueado" }} />
        <Stack.Screen name="CameraUnlock" component={CameraUnlockScreen} options={{ title: "Desbloquear" }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: "Resultado" }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Ajustes" }} />
        <Stack.Screen name="ReferencePhotos" component={ReferencePhotosScreen} options={{ title: "Fotos de referencia" }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: "Acceso" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export function RootNavigator() {
  return <AppNavigator />;
}
