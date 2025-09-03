import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // Add a new achievement notification
  addAchievementNotification: (achievement) => {
    const notification = {
      id: `achievement-${achievement._id}-${Date.now()}`,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `You've earned "${achievement.name}"`,
      achievement: achievement,
      timestamp: new Date(),
      isRead: false,
    };

    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Achievement Unlocked!', {
        body: `You've earned "${achievement.name}"`,
        icon: '/vite.svg', // You can replace with a custom icon
        tag: notification.id
      });
    }
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
      unreadCount: 0
    }));
  },

  // Remove a notification
  removeNotification: (notificationId) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;
      
      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      };
    });
  },

  // Clear all notifications
  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  // Request browser notification permission
  requestNotificationPermission: async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  },

  // Get unread notifications
  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter(n => !n.isRead);
  },

  // Get notifications by type
  getNotificationsByType: (type) => {
    const { notifications } = get();
    return notifications.filter(n => n.type === type);
  }
}));
