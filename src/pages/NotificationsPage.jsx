import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/api';
import { Bell, Check, Trash2, Filter, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    unreadOnly: false
  });
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(filters);
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => 
        prev.filter(notification => notification._id !== id)
      );
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAllRead = async () => {
    const readNotifications = notifications.filter(n => n.read);
    if (readNotifications.length === 0) {
      toast.error('No read notifications to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${readNotifications.length} read notifications?`)) {
      return;
    }

    try {
      // Delete each read notification
      await Promise.all(
        readNotifications.map(notification => 
          notificationService.deleteNotification(notification._id)
        )
      );
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success('All read notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const formatNotificationTime = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInHours = (now - notificationDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return notificationDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'system': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'update': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {pagination.total || 0} total notifications
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all as read
                </button>
              )}
              <button
                onClick={handleDeleteAllRead}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete read
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilters(prev => ({ ...prev, unreadOnly: false, page: 1 }))}
            className={`pb-3 px-4 font-medium transition-colors duration-200 ${
              !filters.unreadOnly 
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, unreadOnly: true, page: 1 }))}
            className={`pb-3 px-4 font-medium transition-colors duration-200 ${
              filters.unreadOnly 
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Unread Only
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="card">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${getNotificationTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            New
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {notification.message}
                      </p>
                      
                      {/* Notification Actions */}
                      <div className="flex space-x-3">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filters.unreadOnly 
                  ? "You don't have any unread notifications" 
                  : "You don't have any notifications yet"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;