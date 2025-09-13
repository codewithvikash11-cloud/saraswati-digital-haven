import { useState, useCallback, useEffect } from 'react';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Make all fields optional for updates
type PartialProfile = Partial<Omit<Profile, 'id'>> & { id: string };

// Type for profile update data
type ProfileUpdateData = {
  full_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  updated_at: string;
  [key: string]: any; // Allow any additional fields
};

// Type for avatar update
type AvatarUpdate = {
  avatar_url: string;
  updated_at: string;
};

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile by user ID
  const fetchProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the current user's profile
  const fetchCurrentUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return await fetchProfile(user.id);
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch current user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Create or update profile
  const upsertProfile = async (profileData: PartialProfile) => {
    try {
      setLoading(true);
      setError(null);

      // Create update data with required fields
      const updateData: ProfileUpdateData = {
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      let result: PostgrestSingleResponse<Profile[]>;

      // Use the correct method based on whether we're creating or updating
      if (profileData.id) {
        result = await (supabase as SupabaseClient)
          .from('profiles')
          .update(updateData)
          .eq('id', profileData.id)
          .select()
          .single();
      } else {
        result = await (supabase as SupabaseClient)
          .from('profiles')
          .insert(updateData as any)
          .select()
          .single();
      }

      const { data, error: upsertError } = result;
      if (upsertError) throw upsertError;
      if (!data) throw new Error('No data returned from upsert operation');

      const profile = data as unknown as Profile;
      setProfile(profile);
      return { data: profile, error: null };
    } catch (error) {
      console.error('Error upserting profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: PartialProfile) => {
    try {
      setLoading(true);
      setError(null);

      if (!updates.id) {
        throw new Error('Profile ID is required for update');
      }

      const updateData: ProfileUpdateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await (supabase as SupabaseClient)
        .from('profiles')
        .update(updateData)
        .eq('id', updates.id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error('No data returned from update operation');

      const profile = data as unknown as Profile;
      setProfile(profile);
      return { data: profile, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Upload profile avatar
  const uploadAvatar = async (userId: string, file: File) => {
    try {
      setLoading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      const updateData: AvatarUpdate = { 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await (supabase as SupabaseClient)
        .from('profiles')
        .update(updateData as any)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error('No data returned from avatar update');

      const profile = data as unknown as Profile;
      setProfile(profile);
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      setError(errorMessage);
      return { url: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = useCallback(async (userId: string) => {
    try {
      const { data, error } = await (supabase as SupabaseClient)
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single<{ role: string }>();

      if (error) throw error;
      if (!data) return false;
      
      return data.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, []);

  // Effect to load profile when userId changes
  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    fetchCurrentUserProfile,
    upsertProfile,
    updateProfile,
    uploadAvatar,
    isAdmin,
  };
};

export default useProfile;
