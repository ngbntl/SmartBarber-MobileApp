import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import NotificationsApi from '@/api/notifications';

export const useNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.userInfo);
  
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    
    try {
      setLoading(true);
      const notificationsApi = new NotificationsApi();
      const response = await notificationsApi.getUnreadCount();
      
      if (response.count !== undefined) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling to check for new notifications every minute
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // 60 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);
  
  return {
    unreadCount,
    loading,
    refreshCount: fetchUnreadCount
  };
};