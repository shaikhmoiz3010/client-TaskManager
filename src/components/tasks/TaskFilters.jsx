import { useState } from 'react';
import { Search, Filter, X, Sparkles, ChevronDown, ChevronUp, Tag, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const TaskFilters = ({ filters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value) => {
    onFilterChange({ search: value, page: 1 });
  };

  const handleStatusChange = (status) => {
    onFilterChange({ status, page: 1 });
  };

  const handlePriorityChange = (priority) => {
    onFilterChange({ priority, page: 1 });
  };

  const clearFilters = () => {
    onFilterChange({ 
      status: '', 
      priority: '', 
      search: '', 
      page: 1 
    });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'pending': return AlertCircle;
      default: return Tag;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'in-progress': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 dark:text-green-400';
      case 'in-progress': return 'text-blue-700 dark:text-blue-400';
      case 'pending': return 'text-yellow-700 dark:text-yellow-400';
      default: return 'text-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      case 'low': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      default: return 'bg-gradient-to-r from-purple-500 to-purple-600';
    }
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-700 dark:text-red-400';
      case 'medium': return 'text-yellow-700 dark:text-yellow-400';
      case 'low': return 'text-green-700 dark:text-green-400';
      default: return 'text-purple-700 dark:text-purple-400';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg mb-6">
      {/* Background Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 -z-10"></div>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Enhanced Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          </div>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            placeholder="Search tasks by title, description, or tags..."
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Enhanced Filter Toggle and Clear */}
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="group relative flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 transform hover:-translate-y-0.5"
            >
              <X className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Clear All
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 ${
              showFilters || hasActiveFilters
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:shadow-purple-500/10'
            }`}
          >
            <Filter className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
            Filters
            {(filters.status || filters.priority) && (
              <span className="ml-2 bg-white/20 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-inner">
                {(filters.status ? 1 : 0) + (filters.priority ? 1 : 0)}
              </span>
            )}
            {showFilters ? (
              <ChevronUp className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform duration-200" />
            )}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 ${showFilters || hasActiveFilters ? 'opacity-100' : ''}`}></div>
          </button>
        </div>
      </div>

      {/* Enhanced Expanded Filters */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-white/30 dark:border-gray-700/50 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status Filter */}
            <div className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm p-5 rounded-xl border border-white/30 dark:border-white/10">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mr-3">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                {['', 'pending', 'in-progress', 'completed'].map((status) => {
                  const StatusIcon = getStatusIcon(status);
                  const isActive = filters.status === status;
                  
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${
                        isActive
                          ? `${getStatusColor(status)} text-white shadow-lg`
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 hover:shadow-md'
                      }`}
                    >
                      <StatusIcon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : getStatusTextColor(status)}`} />
                      {status === '' ? 'All Status' : status.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm p-5 rounded-xl border border-white/30 dark:border-white/10">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mr-3">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Priority
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                {['', 'low', 'medium', 'high'].map((priority) => {
                  const isActive = filters.priority === priority;
                  
                  return (
                    <button
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? `${getPriorityColor(priority)} text-white shadow-lg`
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 hover:shadow-md'
                      }`}
                    >
                      {priority === '' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Active Filter Pills */}
      {hasActiveFilters && (
        <div className="mt-6">
          <div className="flex items-center mb-3">
            <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {filters.search && (
              <span className="group relative inline-flex items-center px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 text-purple-800 dark:text-purple-300 shadow-sm transition-all duration-200 hover:shadow-md">
                <Search className="w-4 h-4 mr-2" />
                "{filters.search}"
                <button
                  onClick={() => handleSearchChange('')}
                  className="ml-3 p-1 hover:bg-purple-200 dark:hover:bg-purple-800/30 rounded-lg transition-colors duration-200 group-hover:scale-110"
                >
                  <X className="w-3 h-3 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className={`group relative inline-flex items-center px-4 py-2 rounded-xl text-sm capitalize ${getStatusTextColor(filters.status)} bg-gradient-to-r ${getStatusColor(filters.status).replace('bg-gradient-to-r', 'from')} bg-opacity-10 shadow-sm transition-all duration-200 hover:shadow-md`}>
                {(() => {
                  const StatusIcon = getStatusIcon(filters.status);
                  return <StatusIcon className="w-4 h-4 mr-2" />;
                })()}
                Status: {filters.status.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
                <button
                  onClick={() => handleStatusChange('')}
                  className="ml-3 p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors duration-200 group-hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.priority && (
              <span className={`group relative inline-flex items-center px-4 py-2 rounded-xl text-sm capitalize ${getPriorityTextColor(filters.priority)} bg-gradient-to-r ${getPriorityColor(filters.priority).replace('bg-gradient-to-r', 'from')} bg-opacity-10 shadow-sm transition-all duration-200 hover:shadow-md`}>
                <AlertCircle className="w-4 h-4 mr-2" />
                Priority: {filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)}
                <button
                  onClick={() => handlePriorityChange('')}
                  className="ml-3 p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors duration-200 group-hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;