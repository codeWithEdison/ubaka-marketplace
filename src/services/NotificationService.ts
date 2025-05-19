
import { supabase } from '@/integrations/supabase/client';

export const fetchNotifications = async (page = 1, limit = 20, includeRead = false) => {
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  
  if (!includeRead) {
    query = query.eq('is_read', false);
  }
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await query.range(from, to);
    
  if (error) throw new Error(error.message);
  
  return {
    notifications: data || [],
    count: count || 0,
    unreadCount: includeRead ? 
      data?.filter(n => !n.is_read).length || 0 : 
      count || 0
  };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
    
  if (error) throw new Error(error.message);
  
  return true;
};

export const markAllNotificationsAsRead = async () => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
    
  if (error) throw new Error(error.message);
  
  return true;
};

export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
    
  if (error) throw new Error(error.message);
  
  return true;
};
