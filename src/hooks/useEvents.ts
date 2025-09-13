import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Event = Database['public']['Tables']['events']['Row'];
type InsertEvent = Database['public']['Tables']['events']['Insert'];
type UpdateEvent = Database['public']['Tables']['events']['Update'];

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all events
  const fetchEvents = useCallback(async (options: { 
    limit?: number; 
    featured?: boolean;
    upcoming?: boolean;
  } = {}) => {
    const { limit, featured, upcoming } = options;
    
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (featured) {
        query = query.eq('is_featured', true);
      }

      if (upcoming) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('event_date', today);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (featured) {
        setFeaturedEvents(data || []);
      } else if (upcoming) {
        setUpcomingEvents(data || []);
      } else {
        setEvents(data || []);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single event by ID
  const fetchEventById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setCurrentEvent(data);
      return data;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to fetch event');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new event
  const createEvent = async (eventData: Omit<InsertEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Refresh the events lists
      await Promise.all([
        fetchEvents(),
        fetchEvents({ featured: true }),
        fetchEvents({ upcoming: true })
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, updates: Partial<UpdateEvent>) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh the events lists and current event
      await Promise.all([
        fetchEvents(),
        fetchEvents({ featured: true }),
        fetchEvents({ upcoming: true }),
        fetchEventById(id)
      ]);
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating event with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the events lists and clear current event if it's the one being deleted
      await Promise.all([
        fetchEvents(),
        fetchEvents({ featured: true }),
        fetchEvents({ upcoming: true })
      ]);
      
      if (currentEvent?.id === id) {
        setCurrentEvent(null);
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Error deleting event with ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Upload event image
  const uploadEventImage = async (file: File, eventId: string) => {
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}-${Date.now()}.${fileExt}`;
      const filePath = `${eventId}/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('event-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-media')
        .getPublicUrl(filePath);

      // Update the event record with the new image URL
      const { error: updateError } = await supabase
        .from('events')
        .update({ image_url: publicUrl })
        .eq('id', eventId);

      if (updateError) throw updateError;

      // Refresh the event data
      await Promise.all([
        fetchEvents(),
        fetchEvents({ featured: true }),
        fetchEvents({ upcoming: true }),
        fetchEventById(eventId)
      ]);
      
      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading event image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setError(errorMessage);
      return { url: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get events by date range
  const getEventsByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const { data, error: rangeError } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true });

      if (rangeError) throw rangeError;

      return data || [];
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events by date range');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    featuredEvents,
    upcomingEvents,
    currentEvent,
    loading,
    error,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    uploadEventImage,
    getEventsByDateRange,
  };
};

export default useEvents;
