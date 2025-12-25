import { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  Calendar, 
  Flag, 
  Tags,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Sparkles,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Hash,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

const TaskList = ({ tasks, loading, onEdit, onDelete, pagination, onPageChange }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const getStatusConfig = (status) => {
    const config = {
      pending: { 
        class: 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-700/50',
        icon: Clock,
        gradient: 'from-yellow-500 to-amber-600'
      },
      'in-progress': { 
        class: 'bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-700/50',
        icon: TrendingUp,
        gradient: 'from-blue-500 to-blue-600'
      },
      completed: { 
        class: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-700/50',
        icon: CheckCircle,
        gradient: 'from-green-500 to-emerald-600'
      }
    };
    return config[status] || config.pending;
  };

  const getPriorityConfig = (priority) => {
    const config = {
      low: { 
        class: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-700/50',
        gradient: 'from-green-500 to-emerald-600'
      },
      medium: { 
        class: 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-700/50',
        gradient: 'from-yellow-500 to-amber-600'
      },
      high: { 
        class: 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-700/50',
        gradient: 'from-red-500 to-rose-600'
      }
    };
    return config[priority] || config.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeLeft = (dateString) => {
    if (!dateString) return null;
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', class: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
    if (diffDays === 0) return { text: 'Due today', class: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    if (diffDays === 1) return { text: 'Due tomorrow', class: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, class: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    return null;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded w-1/4"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-full w-20"></div>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded w-3/4"></div>
                  <div className="flex items-center space-x-6">
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded w-24"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-full w-8 ml-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-lg p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="relative w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            No tasks found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first task to stay organized and productive
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Click "Create New Task" to get started</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task List */}
      {tasks.map((task) => {
        const statusConfig = getStatusConfig(task.status);
        const priorityConfig = getPriorityConfig(task.priority);
        const StatusIcon = statusConfig.icon;
        const timeLeft = getTimeLeft(task.dueDate);
        const isExpanded = expandedTask === task._id;

        return (
          <div
            key={task._id}
            className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${statusConfig.class} ${statusConfig.border} border`}>
                        <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white pr-4">
                        {task.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${priorityConfig.class} ${priorityConfig.text} ${priorityConfig.border} border`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.class} ${statusConfig.text} ${statusConfig.border} border`}>
                        {task.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  </div>

                  {/* Description with Expand/Collapse */}
                  {task.description && (
                    <div className="mb-5">
                      <p className={`text-gray-700 dark:text-gray-300 ${isExpanded ? '' : 'line-clamp-2'} transition-all duration-300`}>
                        {task.description}
                      </p>
                      {task.description.length > 150 && (
                        <button
                          onClick={() => setExpandedTask(isExpanded ? null : task._id)}
                          className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center transition-colors duration-200"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Read more
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Due Date with Time Left */}
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/10">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {formatDate(task.dueDate)}
                      </span>
                      {timeLeft && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${timeLeft.bg} ${timeLeft.class}`}>
                          {timeLeft.text}
                        </span>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/10">
                      <Flag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                        {task.priority} Priority
                      </span>
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/10">
                        <Tags className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <div className="flex flex-wrap gap-1.5">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 text-purple-800 dark:text-purple-300"
                            >
                              <Hash className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Actions Dropdown */}
                <div className="relative ml-6">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === task._id ? null : task._id)}
                    className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/60 dark:hover:from-gray-800/80 dark:hover:to-gray-900/60 rounded-xl border border-transparent hover:border-white/30 dark:hover:border-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transform hover:scale-110"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {activeDropdown === task._id && (
                    <div className="absolute right-0 top-12 w-56 bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 dark:border-white/10 py-2 z-50 animate-fade-in">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 -z-10"></div>
                      
                      <button
                        onClick={() => {
                          onEdit(task);
                          setActiveDropdown(null);
                        }}
                        className="group flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-500/5 transition-all duration-200"
                      >
                        <Edit3 className="w-4 h-4 mr-3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                        Edit Task
                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </button>
                      
                      <div className="border-t border-white/30 dark:border-gray-700/50 my-1"></div>
                      
                      <button
                        onClick={() => {
                          onDelete(task._id);
                          setActiveDropdown(null);
                        }}
                        className="group flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-500/5 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                        Delete Task
                        <AlertCircle className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Enhanced Pagination */}
      {pagination.pages > 1 && (
        <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-lg p-6 mt-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 -z-10"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.current * pagination.limit, pagination.total)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {pagination.total}
              </span>{' '}
              results
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onPageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="group relative flex items-center px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Previous
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold">
                  {pagination.current}
                </span>
                <span className="text-gray-500 dark:text-gray-400">of</span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{pagination.pages}</span>
              </div>
              
              <button
                onClick={() => onPageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="group relative flex items-center px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;