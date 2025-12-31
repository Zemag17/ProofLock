import { VisionThreshold } from "@services/VisionMatchService";

export type RootStackParamList = {
  Home: undefined;
  LockWizard: undefined;
  Blocked: { lockId: string };
  CameraUnlock: { lockId: string };
  Result: { lockId: string; score: number; threshold: VisionThreshold; success: boolean; durationMinutes: number };
  Settings: undefined;
  ReferencePhotos: { lockId?: string } | undefined;
  SignIn: undefined;
};
