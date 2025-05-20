
import { supabase } from '@/integrations/supabase/client';

// Define notification types
export type NotificationType = 'order_status' | 'return_status' | 'system' | 'promotion';

export const fetchNotifications = async (page = 1, limit = 20, includeRead = false) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to fetch notifications');
  }
  
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);
    
  if (error) throw new Error(error.message);
  
  return true;
};

export const markAllNotificationsAsRead = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false)
    .eq('user_id', user.id);
    
  if (error) throw new Error(error.message);
  
  return true;
};

export const deleteNotification = async (notificationId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id);
    
  if (error) throw new Error(error.message);
  
  return true;
};

// Create a notification
export const createNotification = async (
  type: NotificationType,
  title: string,
  message: string,
  data: any = {}
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type,
      title,
      message,
      data
    });
    
  if (error) throw new Error(error.message);
  
  return true;
};
