import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppRepository,
  LockDraft,
  ReferencePhoto,
  RepositoryBootstrap,
  SampleLock,
  User,
  createRepository,
} from "@services/repository";

type Language = "es" | "en";

export type SettingsState = {
  darkMode: boolean;
  language: Language;
  saveAttemptPhotos: boolean;
  attemptsClearedAt: string | null;
};

interface AppState {
  user: User;
  categories: string[];
  locks: SampleLock[];
  referencePhotos: ReferencePhoto[];
  settings: SettingsState;
  toggleLock: (lockId: string) => void;
  revokeSession: (lockId: string) => void;
  addReferencePhoto: (photo: Omit<ReferencePhoto, "id" | "image_path" | "image_url">) => ReferencePhoto;
  updateReferencePhoto: (id: string, data: Partial<Pick<ReferencePhoto, "label" | "category">>) => void;
  deleteReferencePhoto: (id: string) => void;
  addLockFromDraft: (draft: LockDraft) => SampleLock; // Added to interface
  setDarkMode: (value: boolean) => void;
  toggleLanguage: () => void;
  setSaveAttemptPhotos: (value: boolean) => void;
  clearAttemptHistory: () => void;
}

const repository: AppRepository = createRepository("mock");
const bootstrap: RepositoryBootstrap = repository.bootstrap();

const initialState: AppState = {
  user: bootstrap.user,
  categories: bootstrap.categories,
  locks: bootstrap.locks,
  referencePhotos: bootstrap.referencePhotos,
  settings: {
    darkMode: false,
    language: "es",
    saveAttemptPhotos: false,
    attemptsClearedAt: null,
  },
  toggleLock: () => undefined,
  revokeSession: () => undefined,
  addReferencePhoto: () => ({ id: "", uri: "", label: "", category: "", image_path: "", image_url: null }),
  updateReferencePhoto: () => undefined,
  deleteReferencePhoto: () => undefined,
  addLockFromDraft: () => ({ // Added initial stub
    id: "",
    name: "",
    category: "",
    scheduleDays: [],
    schedule: null,
    hasActiveSession: false,
    enabled: false,
  }),
  setDarkMode: () => undefined,
  toggleLanguage: () => undefined,
  setSaveAttemptPhotos: () => undefined,
  clearAttemptHistory: () => undefined,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      toggleLock: (lockId) =>
        set((state) => ({ locks: repository.toggleLock(lockId, state.locks) })),
      revokeSession: (lockId) =>
        set((state) => ({ locks: repository.revokeSession(lockId, state.locks) })),
      addReferencePhoto: (photo) => {
        const { photo: created, referencePhotos } = repository.addReferencePhoto(photo, get().referencePhotos, get().user.id);
        set({ referencePhotos });
        return created;
      },
      updateReferencePhoto: (id, data) => {
        const referencePhotos = repository.updateReferencePhoto(id, data, get().referencePhotos);
        set({ referencePhotos });
      },
      deleteReferencePhoto: (id) => {
        const referencePhotos = repository.deleteReferencePhoto(id, get().referencePhotos);
        set({ referencePhotos });
      },
      addLockFromDraft: (draft) => {
        const lock = repository.addLockFromDraft(draft, get().locks);
        set((state) => ({ locks: [...state.locks, lock] }));
        return lock;
      },
      setDarkMode: (value) => set((state) => ({ settings: { ...state.settings, darkMode: value } })),
      toggleLanguage: () =>
        set((state) => ({
          settings: { ...state.settings, language: state.settings.language === "es" ? "en" : "es" },
        })),
      setSaveAttemptPhotos: (value) =>
        set((state) => ({ settings: { ...state.settings, saveAttemptPhotos: value } })),
      clearAttemptHistory: () =>
        set((state) => ({ settings: { ...state.settings, attemptsClearedAt: new Date().toISOString() } })),
    }),
    {
      name: "prooflock-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
