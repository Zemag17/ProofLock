import { supabase } from "./supabase";

export type ReferencePhotoRecord = {
  id: string;
  lock_id: string;
  user_id: string;
  storage_path: string;
  created_at: string;
};

export interface AddReferencePhotoInput {
  lockId: string;
  userId: string;
  storagePath: string;
}

export async function addReferencePhoto(input: AddReferencePhotoInput): Promise<ReferencePhotoRecord> {
  const { data, error } = await supabase
    .from("reference_photos")
    .insert({
      lock_id: input.lockId,
      user_id: input.userId,
      storage_path: input.storagePath,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ReferencePhotoRecord;
}

export async function getReferencePhotosForLock(lockId: string): Promise<ReferencePhotoRecord[]> {
  const { data, error } = await supabase
    .from("reference_photos")
    .select("id, lock_id, user_id, storage_path, created_at")
    .eq("lock_id", lockId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReferencePhotoRecord[];
}
