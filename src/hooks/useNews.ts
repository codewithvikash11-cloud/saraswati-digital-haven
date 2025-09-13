import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type News = Database['public']['Tables']['news']['Row'];
type InsertNews = Database['public']['Tables']['news']['Insert'];
type UpdateNews = Database['public']['Tables']['news']['Update'];

export const useNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [currentNews, setCurrentNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all news articles
  const fetchNews = useCallback(async (options: { 
    limit?: number; 
    featured?: boolean;
    publishedOnly?: boolean;
  } = {}) => {
    const { limit, featured, publishedOnly = true } = options;
    
    try {
      setLoading(true);
      let query = supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      if (featured) {
        query = query.eq('is_featured', true);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (featured) {
        setFeaturedNews(data || []);
      } else {
        setNews(data || []);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch news');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single news article by ID
  const fetchNewsById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setCurrentNews(data);
      return data;
    } catch (error) {
      console.error(`Error fetching news with ID ${id}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to fetch news article');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new news article
  const createNews = async (newsData: Omit<InsertNews, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      // Generate excerpt if not provided
      const excerpt = newsData.excerpt || 
        (newsData.content ? newsData.content.substring(0, 160) + '...' : '');
      
      const { data, error: createError } = await supabase
        .from('news')
        .insert([{
          ...newsData,
          excerpt,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Refresh the news lists
      await Promise.all([
        fetchNews(),
        fetchNews({ featured: true })
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating news article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create news article';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update a news article
  const updateNews = async (id: string, updates: Partial<UpdateNews>) => {
    try {
      setLoading(true);
      
      // Generate excerpt if content is being updated and excerpt is not explicitly set
      let processedUpdates = { ...updates };
      if (updates.content && !updates.excerpt) {
        processedUpdates = {
          ...processedUpdates,
          excerpt: updates.content.substring(0, 160) + '...'
        };
      }
      
      const { data, error: updateError } = await supabase
        .from('news')
        .update({
          ...processedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the news lists and current news
      await Promise.all([
        fetchNews(),
        fetchNews({ featured: true }),
        fetchNewsById(id)
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating news with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update news article';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete a news article
  const deleteNews = async (id: string) => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the news lists and clear current news if it's the one being deleted
      await Promise.all([
        fetchNews(),
        fetchNews({ featured: true })
      ]);
      
      if (currentNews?.id === id) {
        setCurrentNews(null);
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Error deleting news with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete news article';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Toggle publish status of a news article
  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('news')
        .update({ 
          is_published: !currentStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the news lists and current news
      await Promise.all([
        fetchNews(),
        fetchNews({ featured: true }),
        fetchNewsById(id)
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error toggling publish status for news with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update publish status';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Toggle featured status of a news article
  const toggleFeaturedStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('news')
        .update({ 
          is_featured: !currentStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the news lists and current news
      await Promise.all([
        fetchNews(),
        fetchNews({ featured: true }),
        fetchNewsById(id)
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error toggling featured status for news with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update featured status';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get related news articles (excluding the current one)
  const getRelatedNews = async (currentId: string, limit: number = 3) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('news')
        .select('*')
        .neq('id', currentId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      return data || [];
    } catch (error) {
      console.error('Error fetching related news:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch related news');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    news,
    featuredNews,
    currentNews,
    loading,
    error,
    fetchNews,
    fetchNewsById,
    createNews,
    updateNews,
    deleteNews,
    togglePublishStatus,
    toggleFeaturedStatus,
    getRelatedNews,
  };
};

export default useNews;
