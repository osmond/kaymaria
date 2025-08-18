import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase.types';

// Uploads a file to the "plant-photos" bucket and returns its public URL
export async function uploadPlantPhoto(
  client: SupabaseClient<Database>,
  plantId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${plantId}/${name}`;

  const { error } = await client.storage
    .from('plant-photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } = client.storage.from('plant-photos').getPublicUrl(path);
  return data.publicUrl;
}
