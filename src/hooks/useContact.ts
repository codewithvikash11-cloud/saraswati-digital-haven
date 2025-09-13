import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type ContactInquiry = Database['public']['Tables']['contact_inquiries']['Insert'];
type NewsletterSubscription = Database['public']['Tables']['newsletter_subscriptions']['Insert'];

export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Submit a contact form
  const submitContactForm = useCallback(async (formData: Omit<ContactInquiry, 'id' | 'is_read' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { error: submitError } = await supabase
        .from('contact_inquiries')
        .insert([{
          ...formData,
          is_read: false,
          created_at: new Date().toISOString(),
        }]);

      if (submitError) throw submitError;

      setSuccess(true);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit contact form';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to newsletter
  const subscribeToNewsletter = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Check if email is already subscribed
      const { data: existingSub, error: fetchError } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      if (existingSub) {
        if (existingSub.is_active) {
          return { success: true, message: 'You are already subscribed to our newsletter!', error: null };
        } else {
          // Reactivate subscription
          const { error: updateError } = await supabase
            .from('newsletter_subscriptions')
            .update({ is_active: true })
            .eq('email', email);

          if (updateError) throw updateError;
          
          setSuccess(true);
          return { 
            success: true, 
            message: 'Welcome back! Your subscription has been reactivated.', 
            error: null 
          };
        }
      }

      // Create new subscription
      const { error: insertError } = await supabase
        .from('newsletter_subscriptions')
        .insert([{
          email,
          is_active: true,
          created_at: new Date().toISOString(),
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      return { 
        success: true, 
        message: 'Thank you for subscribing to our newsletter!', 
        error: null 
      };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe to newsletter';
      setError(errorMessage);
      return { 
        success: false, 
        message: null, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Unsubscribe from newsletter
  const unsubscribeFromNewsletter = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { error: updateError } = await supabase
        .from('newsletter_subscriptions')
        .update({ is_active: false })
        .eq('email', email);

      if (updateError) throw updateError;

      setSuccess(true);
      return { 
        success: true, 
        message: 'You have been unsubscribed from our newsletter.', 
        error: null 
      };
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unsubscribe from newsletter';
      setError(errorMessage);
      return { 
        success: false, 
        message: null, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all contact inquiries (admin only)
  const getContactInquiries = useCallback(async (options: { 
    limit?: number; 
    read?: boolean;
  } = {}) => {
    const { limit, read } = options;
    
    try {
      setLoading(true);
      let query = supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (read !== undefined) {
        query = query.eq('is_read', read);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      return data || [];
    } catch (error) {
      console.error('Error fetching contact inquiries:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch contact inquiries');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark inquiry as read (admin only)
  const markInquiryAsRead = useCallback(async (inquiryId: string) => {
    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('contact_inquiries')
        .update({ is_read: true })
        .eq('id', inquiryId);

      if (updateError) throw updateError;

      return { success: true, error: null };
    } catch (error) {
      console.error(`Error marking inquiry ${inquiryId} as read:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark inquiry as read';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all newsletter subscribers (admin only)
  const getNewsletterSubscribers = useCallback(async (options: { 
    limit?: number; 
    activeOnly?: boolean;
  } = {}) => {
    const { limit, activeOnly = true } = options;
    
    try {
      setLoading(true);
      let query = supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      return data || [];
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch newsletter subscribers');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    success,
    submitContactForm,
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
    getContactInquiries,
    markInquiryAsRead,
    getNewsletterSubscribers,
  };
};

export default useContact;
