import { supabase } from "./supabase";

export type AttemptRecord = {
  id: string;
  lock_id: string;
  user_id: string;
  status: "success" | "fail";
  score: number | null;
  reason: string | null;
  captured_image_url: string | null;
  created_at: string;
};

export interface LogAttemptInput {
  lockId: string;
  userId: string;
  status: "success" | "fail";
  score?: number;
  reason?: string;
  capturedImageUrl?: string | null;
}

export async function logAttempt(input: LogAttemptInput): Promise<AttemptRecord> {
  const { data, error } = await supabase
    .from("unlock_attempts")
    .insert({
      lock_id: input.lockId,
      user_id: input.userId,
      status: input.status,
      score: input.score ?? null,
      reason: input.reason ?? null,
      captured_image_url: input.capturedImageUrl ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AttemptRecord;
}
