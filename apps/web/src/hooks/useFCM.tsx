import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';

export const useFCM = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!messaging || !user) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground push notification received:', payload);
      
      const { notification } = payload;
      if (notification?.title) {
        toast(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm">{notification.title}</span>
              {notification.body && <span className="text-xs">{notification.body}</span>}
            </div>
          ),
          { duration: 5000 }
        );
      }

      // Invalidate the notifications query to update the navbar badge
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, user]);
};
