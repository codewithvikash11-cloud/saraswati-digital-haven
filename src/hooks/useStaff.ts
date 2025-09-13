import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Staff = Database['public']['Tables']['staff']['Row'];
type InsertStaff = Database['public']['Tables']['staff']['Insert'];
type UpdateStaff = Database['public']['Tables']['staff']['Update'];

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);

  // Fetch all staff members
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('staff')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setStaff(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch staff');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single staff member by ID
  const fetchStaffById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setCurrentStaff(data);
      return data;
    } catch (error) {
      console.error(`Error fetching staff with ID ${id}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to fetch staff member');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new staff member
  const createStaff = async (staffData: Omit<InsertStaff, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('staff')
        .insert([{
          ...staffData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Refresh the staff list
      await fetchStaff();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating staff:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create staff member';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing staff member
  const updateStaff = async (id: string, updates: Partial<UpdateStaff>) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('staff')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the staff list and current staff
      await Promise.all([fetchStaff(), fetchStaffById(id)]);
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating staff with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update staff member';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete a staff member
  const deleteStaff = async (id: string) => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the staff list and clear current staff if it's the one being deleted
      await fetchStaff();
      if (currentStaff?.id === id) {
        setCurrentStaff(null);
      }
      return { error: null };
    } catch (error) {
      console.error(`Error deleting staff with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete staff member';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Upload staff photo
  const uploadStaffPhoto = async (file: File, staffId: string) => {
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${staffId}-${Date.now()}.${fileExt}`;
      const filePath = `${staffId}/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('staff-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('staff-photos')
        .getPublicUrl(filePath);

      // Update the staff record with the new photo URL
      const { error: updateError } = await supabase
        .from('staff')
        .update({ photo_url: publicUrl })
        .eq('id', staffId);

      if (updateError) throw updateError;

      // Refresh the staff data
      await Promise.all([fetchStaff(), fetchStaffById(staffId)]);
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading staff photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      setError(errorMessage);
      return { url: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    staff,
    currentStaff,
    loading,
    error,
    fetchStaff,
    fetchStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    uploadStaffPhoto,
  };
};

export default useStaff;
