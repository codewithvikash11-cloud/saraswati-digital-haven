import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function to handle file uploads
export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File
): Promise<{ data: { path: string } | null; error: Error | null }> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading file:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

// Helper function to get public URL for a file
export const getPublicUrl = (bucket: string, filePath: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

// Helper function to handle errors
export const handleError = (error: unknown, defaultMessage = 'An error occurred'): string => {
  console.error(error);
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};
