import { supabase } from "./supabase";

export type UnlockSessionRecord = {
  id: string;
  lock_id: string;
  user_id: string;
  expires_at: string;
  active: boolean;
  created_at: string;
};

export interface CreateSessionInput {
  lockId: string;
  userId: string;
  expiresAt: string; // ISO timestamp
}

export async function createUnlockSession(input: CreateSessionInput): Promise<UnlockSessionRecord> {
  const { data, error } = await supabase
    .from("unlock_sessions")
    .insert({
      lock_id: input.lockId,
      user_id: input.userId,
      expires_at: input.expiresAt,
      active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as UnlockSessionRecord;
}

export async function revokeUnlockSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("unlock_sessions")
    .update({ active: false })
    .eq("id", sessionId);

  if (error) throw error;
}
