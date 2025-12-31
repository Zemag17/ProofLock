export type LockTargetType = "app" | "web";

export type DayOfWeek =
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat";

export interface LockSchedule {
  days: DayOfWeek[]; // Days when the lock is active
  startTime?: string; // HH:MM 24h, optional for all-day
  endTime?: string; // HH:MM 24h, optional for all-day
}

export interface ReferencePhoto {
  id: string;
  lockId: string;
  uri: string;
  image_path: string; // storage path e.g., reference-photos/{userId}/{uuid}.jpg
  image_url: string | null; // optional signed/public url
  uploadedAt: string;
}

export interface Lock {
  id: string;
  name: string;
  targetType: LockTargetType;
  targetValue: string; // app bundle id or URL hostname
  referencePhotos: ReferencePhoto[];
  schedule?: LockSchedule;
  createdAt: string;
}

export interface UnlockAttempt {
  id: string;
  lockId: string;
  status: "success" | "fail";
  createdAt: string;
  durationSeconds?: number;
}

export interface UnlockSession {
  id: string;
  lockId: string;
  startedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface VisionMatchResult {
  matched: boolean;
  score: number;
  reason?: string;
}
