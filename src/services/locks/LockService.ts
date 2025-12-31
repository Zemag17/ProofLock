import { v4 as uuid } from "uuid";
import {
  Lock,
  ReferencePhoto,
  UnlockAttempt,
  UnlockSession,
} from "@types/domain";
import { supabaseClient } from "@services/supabase/client";

const mockLocks: Lock[] = [];

export class LockService {
  async listLocks(): Promise<Lock[]> {
    // TODO: replace with Supabase fetch
    return mockLocks;
  }

  async createLock(lock: Omit<Lock, "id" | "createdAt" | "referencePhotos">): Promise<Lock> {
    const newLock: Lock = {
      ...lock,
      id: uuid(),
      createdAt: new Date().toISOString(),
      referencePhotos: [],
    };
    mockLocks.push(newLock);
    return newLock;
  }

  async addReferencePhoto(lockId: string, uri: string): Promise<ReferencePhoto> {
    const lock = mockLocks.find((l) => l.id === lockId);
    if (!lock) throw new Error("Lock not found");

    const photo: ReferencePhoto = {
      id: uuid(),
      lockId,
      uri,
      image_path: `reference-photos/${lockId}/${Date.now()}.jpg`,
      image_url: null,
      uploadedAt: new Date().toISOString(),
    };
    lock.referencePhotos.push(photo);
    // TODO: store in Supabase storage
    return photo;
  }

  async recordAttempt(attempt: UnlockAttempt): Promise<void> {
    // TODO: persist attempt securely
    void attempt;
  }

  async createSession(lockId: string, durationMinutes: number): Promise<UnlockSession> {
    const now = new Date();
    const expires = new Date(now.getTime() + durationMinutes * 60000);
    return {
      id: uuid(),
      lockId,
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      active: true,
    };
  }
}
