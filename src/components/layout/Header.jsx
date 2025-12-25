import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContent';
import { notificationService } from '../../services/api'; 
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  LogOut, 
  User, 
  Menu, 
  X, 
  Bell, 
  Sun,
  Moon,
  ChevronDown,
  Check,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Fetch notifications when component mounts
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationService.getNotifications({ 
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      if (response.data?.notifications) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Fallback to mock data if API fails
      setNotifications([
        { 
          _id: 1, 
          title: 'Welcome!',
          message: 'Welcome to Task Manager!', 
          type: 'system',
          read: true, 
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Refresh notifications when dropdown is opened
  const handleNotificationClick = async () => {
    if (!showNotifications) {
      await fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // User dropdown will be handled by CSS :hover
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerClasses = `
    sticky top-0 z-50
    bg-gradient-to-r from-purple-900/90 via-purple-800/90 to-indigo-900/90
    backdrop-blur-xl
    shadow-2xl shadow-purple-900/30
    transition-all duration-500 ease-out
    ${isScrolled ? 'py-2 shadow-2xl' : 'py-3'}
    border-b border-white/20
  `;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality here
    }
  };

  const handleCreateTask = () => {
    console.log('Create new task');
    // Implement create task functionality
  };

  // Handle mark notification as read
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update all notifications to read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      // Remove from local state
      const notificationToDelete = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      // Update unread count if notification was unread
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Format time display
  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get notification type color
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'task': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25';
      case 'system': return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25';
      case 'reminder': return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25';
      case 'update': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25';
    }
  };

  return (
    <>
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Left Section - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-900/50 ring-2 ring-white/30 group-hover:ring-purple-400/60 transition-all duration-300">
                    <span className="text-white font-bold text-xl bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">TM</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                  </div>
                  {/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full ring-2 ring-purple-900 animate-pulse"></div> */}
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent tracking-tight">
                    Task Manager
                  </h1>
                </div>
              </div>  
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="relative p-2.5 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 text-white hover:text-white hover:bg-gradient-to-br hover:from-white/20 hover:to-transparent transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 group"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" /> : <Moon className="w-5 h-5 transform group-hover:-rotate-12 transition-transform duration-300" />}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={handleNotificationClick}
                  className={`relative p-2.5 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 text-white hover:text-white hover:bg-gradient-to-br hover:from-white/20 hover:to-transparent transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 group ${unreadCount > 0 ? 'animate-pulse hover:animate-none' : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                      {unreadCount}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-14 w-80 bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-900/20 border border-white/30 dark:border-white/10 animate-fade-in">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10"></div>
                    
                    <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                        <div className="flex items-center space-x-3">
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/25"
                              title="Mark all as read"
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span>Mark all</span>
                            </button>
                          )}
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 px-3 py-1.5 rounded-full font-medium">
                            {unreadCount} unread
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-8 text-center">
                          <div className="relative w-12 h-12 mx-auto">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin"></div>
                            <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                            <Bell className="w-8 h-8 text-purple-400 dark:text-purple-500" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            You're all caught up!
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-white/20 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group ${
                              !notification.read ? 'bg-gradient-to-r from-blue-50/50 to-blue-50/30 dark:from-blue-900/20 dark:to-blue-900/10' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-xs px-3 py-1 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                                    {notification.type}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded">
                                    {formatTime(notification.createdAt)}
                                  </span>
                                </div>
                                
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {notification.title}
                                </h4>
                                
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                  {notification.message}
                                </p>
                                
                                {notification.data?.taskId && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Task ID: <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{notification.data.taskId}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col space-y-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {!notification.read && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                                    className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25 transform hover:scale-110"
                                    title="Mark as read"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                                  className="p-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg hover:from-rose-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-rose-500/25 transform hover:scale-110"
                                  title="Delete notification"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-white/20 dark:border-gray-700/50">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          // Navigate to full notifications page
                          console.log('Navigate to notifications page');
                        }}
                        className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 text-purple-600 dark:text-purple-400 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Desktop */}
              <div className="hidden md:flex items-center space-x-2" ref={dropdownRef}>
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-2 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 group">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{user?.name}</p>
                      <p className="text-xs text-purple-200/80">{user?.email}</p>
                    </div>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 ring-2 ring-white/30 group-hover:ring-purple-400/60 transition-all duration-300">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-purple-200 group-hover:text-white transition-transform group-hover:rotate-180 duration-300" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-14 w-56 bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-900/20 border border-white/30 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10"></div>
                    
                    <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
                      <p className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <div className="border-t border-white/20 dark:border-gray-700/50 my-2"></div>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-3 py-3 text-rose-600 dark:text-rose-400 hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-rose-500/5 rounded-xl transition-all duration-300 group"
                      >
                        <LogOut className="w-4 h-4 mr-3 transform group-hover:-translate-x-1 transition-transform duration-300" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 text-white hover:text-white hover:bg-gradient-to-br hover:from-white/20 hover:to-transparent transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 group"
              >
                {isMenuOpen ? <X className="w-6 h-6 transform rotate-180 transition-transform duration-300" /> : <Menu className="w-6 h-6" />}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl shadow-2xl shadow-purple-900/20 border-b border-white/30 dark:border-white/10 animate-slide-down">
          <div className="px-4 py-6 space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-4 pb-4 border-b border-white/20 dark:border-gray-700/50">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full ring-2 ring-white"></div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-white/20 dark:border-gray-700/50 space-y-2">
              <button 
                onClick={toggleDarkMode}
                className="flex items-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-gray-700 dark:text-gray-300 transition-all duration-300 group"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-5 h-5 mr-3 text-amber-500" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 mr-3 text-indigo-500" />
                    Dark Mode
                  </>
                )}
              </button>
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500/10 to-rose-500/5 hover:from-rose-500/20 hover:to-rose-500/10 text-rose-600 dark:text-rose-400 transition-all duration-300 group"
              >
                <LogOut className="w-5 h-5 mr-3 transform group-hover:-translate-x-1 transition-transform duration-300" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add these styles to your global CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;