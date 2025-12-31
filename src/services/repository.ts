import { LockSchedule } from "@services/schedule";
import { VisionThreshold } from "@services/VisionMatchService";

export type RepositoryMode = "mock" | "supabase";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type StorageBackedReferencePhoto = {
  id: string;
  uri: string;
  label: string;
  category: string;
  image_path: string;
  image_url: string | null;
};

export type SampleLock = {
  id: string;
  name: string;
  category: string;
  scheduleDays: string[];
  schedule?: LockSchedule | null;
  hasActiveSession: boolean;
  enabled: boolean;
};

export type ReferencePhoto = StorageBackedReferencePhoto;

export type LockDraft = {
  title: string;
  type: "apps" | "web";
  targets: string[];
  referencePhotoIds: string[];
  threshold: VisionThreshold;
  durationMinutes: number;
  schedule?: LockSchedule | null;
  saveAttemptPhotos: boolean;
};

export interface RepositoryBootstrap {
  user: User;
  categories: string[];
  locks: SampleLock[];
  referencePhotos: ReferencePhoto[];
}

export interface AppRepository {
  bootstrap(): RepositoryBootstrap;
  toggleLock(lockId: string, locks: SampleLock[]): SampleLock[];
  revokeSession(lockId: string, locks: SampleLock[]): SampleLock[];
  addReferencePhoto(
    photo: Omit<ReferencePhoto, "id" | "image_path" | "image_url">,
    referencePhotos: ReferencePhoto[],
    userId: string
  ): { photo: ReferencePhoto; referencePhotos: ReferencePhoto[] };
  addLockFromDraft(draft: LockDraft, locks: SampleLock[]): SampleLock;
  addLockFromDraft(draft: LockDraft, locks: SampleLock[]): SampleLock;
  updateReferencePhoto(
    id: string,
    data: Partial<Pick<ReferencePhoto, "label" | "category">>,
    referencePhotos: ReferencePhoto[]
  ): ReferencePhoto[];
  deleteReferencePhoto(id: string, referencePhotos: ReferencePhoto[]): ReferencePhoto[];
}

class MockRepository implements AppRepository {
  private readonly seed: RepositoryBootstrap = {
    user: { id: "user-1", name: "Lucía", email: "lucia@example.com" },
    categories: ["Sofá", "Gimnasio", "Playa", "Comida"],
    locks: [
      {
        id: "lock-1",
        name: "Bloqueo de redes",
        category: "Sofá",
        scheduleDays: ["lun", "mar", "mié", "jue", "vie", "sáb"],
        schedule: null,
        hasActiveSession: true,
        enabled: true,
      },
    ],
    referencePhotos: [],
  };

  bootstrap(): RepositoryBootstrap {
    return {
      user: { ...this.seed.user },
      categories: [...this.seed.categories],
      locks: this.seed.locks.map((lock) => ({ ...lock })),
      referencePhotos: [...this.seed.referencePhotos],
    };
  }

  toggleLock(lockId: string, locks: SampleLock[]): SampleLock[] {
    return locks.map((lock) =>
      lock.id === lockId ? { ...lock, enabled: !lock.enabled } : lock
    );
  }

  revokeSession(lockId: string, locks: SampleLock[]): SampleLock[] {
    return locks.map((lock) =>
      lock.id === lockId ? { ...lock, hasActiveSession: false } : lock
    );
  }

  addReferencePhoto(
    photo: Omit<ReferencePhoto, "id" | "image_path" | "image_url">,
    referencePhotos: ReferencePhoto[],
    userId: string
  ) {
    const image_path = `reference-photos/${userId}/photo-${Date.now()}.jpg`;
    const created: ReferencePhoto = { ...photo, id: `photo-${Date.now()}`, image_path, image_url: null };
    return { photo: created, referencePhotos: [...referencePhotos, created] };
  }

  addLockFromDraft(draft: LockDraft, locks: SampleLock[]): SampleLock {
    const dayLabels = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
    const scheduleDays = draft.schedule?.days?.length
      ? draft.schedule.days.map((d) => dayLabels[d - 1] ?? "").filter(Boolean)
      : dayLabels;

    const lock: SampleLock = {
      id: `lock-${Date.now()}`,
      name: draft.title,
      category: draft.targets[0] ?? draft.type,
      scheduleDays,
      schedule: draft.schedule ?? null,
      hasActiveSession: false,
      enabled: true,
    };

    locks.push(lock);
    return lock;
  }

  updateReferencePhoto(
    id: string,
    data: Partial<Pick<ReferencePhoto, "label" | "category">>,
    referencePhotos: ReferencePhoto[]
  ): ReferencePhoto[] {
    return referencePhotos.map((photo) =>
      photo.id === id ? { ...photo, ...data } : photo
    );
  }

  deleteReferencePhoto(id: string, referencePhotos: ReferencePhoto[]): ReferencePhoto[] {
    return referencePhotos.filter((photo) => photo.id !== id);
  }
}

class SupabaseRepository implements AppRepository {
  // TODO: wire Supabase client calls
  bootstrap(): RepositoryBootstrap {
    return { user: { id: "", name: "", email: "" }, categories: [], locks: [], referencePhotos: [] };
  }

  toggleLock(lockId: string, locks: SampleLock[]): SampleLock[] {
    return locks;
  }

  revokeSession(lockId: string, locks: SampleLock[]): SampleLock[] {
    return locks;
  }

  addReferencePhoto(
    photo: Omit<ReferencePhoto, "id" | "image_path" | "image_url">,
    referencePhotos: ReferencePhoto[],
    userId: string
  ) {
    return { photo: { ...photo, id: `pending-${Date.now()}`, image_path: "", image_url: null }, referencePhotos };
  }

  addLockFromDraft(_draft: LockDraft, _locks: SampleLock[]): SampleLock {
    return {
      id: `pending-${Date.now()}`,
      name: "",
      category: "",
      scheduleDays: [],
      schedule: null,
      hasActiveSession: false,
      enabled: true,
    };
  }

  updateReferencePhoto(
    id: string,
    data: Partial<Pick<ReferencePhoto, "label" | "category">>,
    referencePhotos: ReferencePhoto[]
  ): ReferencePhoto[] {
    return referencePhotos;
  }

  deleteReferencePhoto(id: string, referencePhotos: ReferencePhoto[]): ReferencePhoto[] {
    return referencePhotos;
  }
}

export function createRepository(mode: RepositoryMode = "mock"): AppRepository {
  if (mode === "supabase") {
    return new SupabaseRepository();
  }
  return new MockRepository();
}
