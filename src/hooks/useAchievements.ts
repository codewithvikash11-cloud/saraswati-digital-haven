import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type InsertAchievement = Database['public']['Tables']['achievements']['Insert'];
type UpdateAchievement = Database['public']['Tables']['achievements']['Update'];

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [featuredAchievements, setFeaturedAchievements] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all achievements
  const fetchAchievements = useCallback(async (options: { 
    limit?: number; 
    featured?: boolean;
    classLevel?: '10' | '12' | 'both';
    year?: number;
  } = {}) => {
    const { limit, featured, classLevel, year } = options;
    
    try {
      setLoading(true);
      let query = supabase
        .from('achievements')
        .select('*')
        .order('year', { ascending: false })
        .order('title', { ascending: true });

      if (featured) {
        query = query.eq('is_featured', true);
      }

      if (classLevel) {
        query = query.or(`class_level.eq.${classLevel},class_level.eq.both`);
      }

      if (year) {
        query = query.eq('year', year);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (featured) {
        setFeaturedAchievements(data || []);
      } else {
        setAchievements(data || []);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch achievements');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single achievement by ID
  const fetchAchievementById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setCurrentAchievement(data);
      return data;
    } catch (error) {
      console.error(`Error fetching achievement with ID ${id}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to fetch achievement');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new achievement
  const createAchievement = async (achievementData: Omit<InsertAchievement, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('achievements')
        .insert([{
          ...achievementData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Refresh the achievements lists
      await Promise.all([
        fetchAchievements(),
        fetchAchievements({ featured: true })
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating achievement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create achievement';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing achievement
  const updateAchievement = async (id: string, updates: Partial<UpdateAchievement>) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('achievements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the achievements lists and current achievement
      await Promise.all([
        fetchAchievements(),
        fetchAchievements({ featured: true }),
        fetchAchievementById(id)
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating achievement with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update achievement';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete an achievement
  const deleteAchievement = async (id: string) => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the achievements lists and clear current achievement if it's the one being deleted
      await Promise.all([
        fetchAchievements(),
        fetchAchievements({ featured: true })
      ]);
      
      if (currentAchievement?.id === id) {
        setCurrentAchievement(null);
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Error deleting achievement with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete achievement';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Upload achievement image
  const uploadAchievementImage = async (file: File, achievementId: string) => {
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${achievementId}-${Date.now()}.${fileExt}`;
      const filePath = `achievements/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('school-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('school-assets')
        .getPublicUrl(filePath);

      // Update the achievement record with the new image URL
      const { error: updateError } = await supabase
        .from('achievements')
        .update({ image_url: publicUrl })
        .eq('id', achievementId);

      if (updateError) throw updateError;

      // Refresh the achievement data
      await Promise.all([
        fetchAchievements(),
        fetchAchievements({ featured: true }),
        fetchAchievementById(achievementId)
      ]);
      
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading achievement image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setError(errorMessage);
      return { url: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Toggle featured status of an achievement
  const toggleFeaturedStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('achievements')
        .update({ 
          is_featured: !currentStatus
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the achievements lists and current achievement
      await Promise.all([
        fetchAchievements(),
        fetchAchievements({ featured: true }),
        fetchAchievementById(id)
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error toggling featured status for achievement with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update featured status';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get unique years for filtering
  const getAchievementYears = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('year')
        .order('year', { ascending: false });

      if (error) throw error;

      // Extract unique years and sort in descending order
      const years = Array.from(new Set(data?.map(item => item.year))).sort((a, b) => b - a);
      return years;
    } catch (error) {
      console.error('Error fetching achievement years:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch achievement years');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    achievements,
    featuredAchievements,
    currentAchievement,
    loading,
    error,
    fetchAchievements,
    fetchAchievementById,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    uploadAchievementImage,
    toggleFeaturedStatus,
    getAchievementYears,
  };
};

export default useAchievements;
