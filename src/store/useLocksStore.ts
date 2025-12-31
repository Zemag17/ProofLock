import { create } from "zustand";
import {
  Lock,
  ReferencePhoto,
  UnlockAttempt,
  UnlockSession,
  VisionMatchResult,
} from "@types/domain";
import { LockService } from "@services/locks/LockService";
import { StubVisionMatchService } from "@services/vision/StubVisionMatchService";
import { VisionMatchService } from "@services/vision/VisionMatchService";
import { v4 as uuid } from "uuid";

interface LocksState {
  locks: Lock[];
  attempts: UnlockAttempt[];
  sessions: UnlockSession[];
  loading: boolean;
  loadLocks: () => Promise<void>;
  createLock: (input: Omit<Lock, "id" | "createdAt" | "referencePhotos">) => Promise<Lock>;
  addReferencePhoto: (lockId: string, uri: string) => Promise<ReferencePhoto>;
  attemptUnlock: (
    lockId: string,
    livePhotoUri: string,
    durationMinutes: number
  ) => Promise<{ result: VisionMatchResult; session?: UnlockSession }>;
}

const lockService = new LockService();
const visionService: VisionMatchService = new StubVisionMatchService();

export const useLocksStore = create<LocksState>((set, get) => ({
  locks: [],
  attempts: [],
  sessions: [],
  loading: false,

  loadLocks: async () => {
    set({ loading: true });
    const locks = await lockService.listLocks();
    set({ locks, loading: false });
  },

  createLock: async (input) => {
    const lock = await lockService.createLock(input);
    set((state) => ({ locks: [...state.locks, lock] }));
    return lock;
  },

  addReferencePhoto: async (lockId, uri) => {
    const photo = await lockService.addReferencePhoto(lockId, uri);
    set((state) => ({
      locks: state.locks.map((lock) =>
        lock.id === lockId
          ? { ...lock, referencePhotos: [...lock.referencePhotos, photo] }
          : lock
      ),
    }));
    return photo;
  },

  attemptUnlock: async (lockId, livePhotoUri, durationMinutes) => {
    const lock = get().locks.find((l) => l.id === lockId);
    if (!lock) throw new Error("Lock not found");

    const result = await visionService.compareLiveCapture(
      lock.referencePhotos,
      livePhotoUri
    );

    const attempt: UnlockAttempt = {
      id: uuid(),
      lockId,
      status: result.matched ? "success" : "fail",
      createdAt: new Date().toISOString(),
      durationSeconds: undefined,
    };
    set((state) => ({ attempts: [attempt, ...state.attempts] }));
    await lockService.recordAttempt(attempt);

    if (!result.matched) {
      return { result };
    }

    const session = await lockService.createSession(lockId, durationMinutes);
    set((state) => ({ sessions: [session, ...state.sessions] }));
    return { result, session };
  },
}));
