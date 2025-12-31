import { supabase } from "./supabase";

export type LockRecord = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  schedule_days: string[];
  created_at: string;
};

export interface CreateLockInput {
  userId: string;
  name: string;
  category?: string;
  scheduleDays: string[];
}

export async function createLock(input: CreateLockInput): Promise<LockRecord> {
  const { data, error } = await supabase
    .from("locks")
    .insert({
      user_id: input.userId,
      name: input.name,
      category: input.category ?? null,
      schedule_days: input.scheduleDays,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LockRecord;
}

export async function getLocksForUser(userId: string): Promise<LockRecord[]> {
  const { data, error } = await supabase
    .from("locks")
    .select("id, user_id, name, category, schedule_days, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LockRecord[];
}
