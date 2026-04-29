import { createClient } from './client';

const BUCKET_NAME = 'dps-assets';

export async function uploadFile(file: File, path: string) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  console.log('Uploading file:', { fileName, filePath, fileSize: file.size, fileType: file.type });

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }

  console.log('Upload successful:', data.path);
  return data.path;
}

export async function deleteFile(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) throw error;
}

export function getPublicUrl(path: string) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}
