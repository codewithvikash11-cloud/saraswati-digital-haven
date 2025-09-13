import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type GalleryCategory = Database['public']['Tables']['gallery_categories']['Row'];
type InsertGalleryCategory = Database['public']['Tables']['gallery_categories']['Insert'];
type UpdateGalleryCategory = Database['public']['Tables']['gallery_categories']['Update'];

type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];
type InsertGalleryItem = Database['public']['Tables']['gallery_items']['Insert'];
type UpdateGalleryItem = Database['public']['Tables']['gallery_items']['Update'];

interface GalleryItemWithCategory extends GalleryItem {
  category: GalleryCategory | null;
}

export const useGallery = () => {
  // Categories state
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<GalleryCategory | null>(null);
  
  // Items state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<GalleryItemWithCategory | null>(null);
  const [featuredItems, setFeaturedItems] = useState<GalleryItem[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== CATEGORY OPERATIONS =====

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching gallery categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch gallery categories');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single category by ID
  const fetchCategoryById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('gallery_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setCurrentCategory(data);
      return data;
    } catch (error) {
      console.error(`Error fetching gallery category with ID ${id}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to fetch gallery category');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new category
  const createCategory = async (categoryData: Omit<InsertGalleryCategory, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('gallery_categories')
        .insert([{
          ...categoryData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Refresh the categories list
      await fetchCategories();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating gallery category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create gallery category';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update a category
  const updateCategory = async (id: string, updates: Partial<UpdateGalleryCategory>) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('gallery_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the categories list and current category
      await Promise.all([fetchCategories(), fetchCategoryById(id)]);
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating gallery category with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update gallery category';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      
      // First, check if there are any items in this category
      const { count, error: countError } = await supabase
        .from('gallery_items')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countError) throw countError;
      
      if (count && count > 0) {
        throw new Error('Cannot delete category with existing items. Please move or delete the items first.');
      }

      // If no items, proceed with deletion
      const { error: deleteError } = await supabase
        .from('gallery_categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the categories list and clear current category if it's the one being deleted
      await fetchCategories();
      if (currentCategory?.id === id) {
        setCurrentCategory(null);
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Error deleting gallery category with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete gallery category';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ===== GALLERY ITEM OPERATIONS =====

  // Fetch all gallery items with optional filtering
  const fetchGalleryItems = useCallback(async (options: { 
    categoryId?: string; 
    limit?: number; 
    featured?: boolean;
  } = {}) => {
    const { categoryId, limit, featured } = options;
    
    try {
      setLoading(true);
      let query = supabase
        .from('gallery_items')
        .select('*, category:gallery_categories(*)')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (featured) {
        // This would require a 'is_featured' column in the gallery_items table
        // If you don't have it, you can implement a different way to feature items
        query = query.limit(8); // Just get the latest 8 as featured for now
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Type assertion since we're adding the category relation
      const itemsWithCategory = data as unknown as GalleryItemWithCategory[];
      
      if (featured) {
        setFeaturedItems(itemsWithCategory || []);
      } else {
        setGalleryItems(itemsWithCategory || []);
      }

      return itemsWithCategory || [];
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch gallery items');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single gallery item by ID with its category
  const fetchGalleryItemById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('gallery_items')
        .select('*, category:gallery_categories(*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Type assertion since we're adding the category relation
      const itemWithCategory = data as unknown as GalleryItemWithCategory;
      
      setCurrentItem(itemWithCategory);
      return itemWithCategory;
    } catch (error) {
      console.error(`Error fetching gallery item with ID ${id}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to fetch gallery item');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new gallery item
  const createGalleryItem = async (itemData: Omit<InsertGalleryItem, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('gallery_items')
        .insert([{
          ...itemData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Refresh the gallery items list
      await fetchGalleryItems();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating gallery item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create gallery item';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update a gallery item
  const updateGalleryItem = async (id: string, updates: Partial<UpdateGalleryItem>) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('gallery_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the gallery items list and current item
      await Promise.all([
        fetchGalleryItems(),
        fetchGalleryItemById(id)
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating gallery item with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update gallery item';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete a gallery item
  const deleteGalleryItem = async (id: string, mediaUrl: string) => {
    try {
      setLoading(true);
      
      // First, delete the media file from storage if it exists
      if (mediaUrl) {
        // Extract the file path from the URL
        const filePath = mediaUrl.split('/').pop();
        if (filePath) {
          const { error: deleteMediaError } = await supabase.storage
            .from('gallery-media')
            .remove([filePath]);

          if (deleteMediaError) {
            console.warn('Error deleting media file, but continuing with item deletion:', deleteMediaError);
          }
        }
      }

      // Then delete the gallery item
      const { error: deleteError } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the gallery items list and clear current item if it's the one being deleted
      await fetchGalleryItems();
      if (currentItem?.id === id) {
        setCurrentItem(null);
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Error deleting gallery item with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete gallery item';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Upload gallery media (image or video)
  const uploadGalleryMedia = async (file: File, itemId: string) => {
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const fileName = `${itemId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileType}s/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('gallery-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-media')
        .getPublicUrl(filePath);

      // Update the gallery item with the new media URL
      const { error: updateError } = await supabase
        .from('gallery_items')
        .update({ 
          media_url: publicUrl,
          media_type: fileType as 'image' | 'video'
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Refresh the gallery item data
      await fetchGalleryItemById(itemId);
      
      return { url: publicUrl, type: fileType, error: null };
    } catch (error) {
      console.error('Error uploading gallery media:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload media';
      setError(errorMessage);
      return { url: null, type: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    // Categories
    categories,
    currentCategory,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Gallery Items
    galleryItems,
    featuredItems,
    currentItem,
    fetchGalleryItems,
    fetchGalleryItemById,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    uploadGalleryMedia,
    
    // Common
    loading,
    error,
  };
};

export default useGallery;
