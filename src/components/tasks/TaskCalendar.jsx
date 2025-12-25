import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
  differenceInDays
} from 'date-fns';

const TaskCalendar = ({ tasks, onDateSelect, onTaskSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [days, setDays] = useState([]);
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
    const [filterStatus, setFilterStatus] = useState(''); // '', 'completed', 'in-progress', 'pending'

    useEffect(() => {
        let daysArray = [];
        
        if (viewMode === 'month') {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);
            daysArray = eachDayOfInterval({ start: monthStart, end: monthEnd });
        } else if (viewMode === 'week') {
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
            const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
            daysArray = eachDayOfInterval({ start: weekStart, end: weekEnd });
        }
        
        setDays(daysArray);
    }, [currentDate, viewMode]);

    const getTasksForDate = (date) => {
        let filteredTasks = tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });

        if (filterStatus) {
            filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
        }

        return filteredTasks;
    };

    const handlePrev = () => {
        if (viewMode === 'month') {
            setCurrentDate(prev => subMonths(prev, 1));
        } else {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
        }
    };

    const handleNext = () => {
        if (viewMode === 'month') {
            setCurrentDate(prev => addMonths(prev, 1));
        } else {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in-progress': return 'bg-blue-500';
            case 'pending': return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusTextColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 dark:text-green-400';
            case 'in-progress': return 'text-blue-600 dark:text-blue-400';
            case 'pending': return 'text-yellow-600 dark:text-yellow-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-l-4 border-red-500';
            case 'medium': return 'border-l-4 border-yellow-500';
            case 'low': return 'border-l-4 border-green-500';
            default: return 'border-l-4 border-gray-300';
        }
    };

    const isOverdue = (task) => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return isBefore(dueDate, today) && !isSameDay(dueDate, today);
    };

    const isUpcoming = (task) => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return isSameDay(dueDate, tomorrow);
    };

    const getTaskStats = () => {
        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            pending: tasks.filter(t => t.status === 'pending').length,
            overdue: tasks.filter(t => isOverdue(t)).length,
            upcoming: tasks.filter(t => isUpcoming(t)).length,
            today: tasks.filter(t => {
                if (!t.dueDate) return false;
                return isSameDay(new Date(t.dueDate), new Date());
            }).length
        };

        return stats;
    };

    const exportCalendar = () => {
        const calendarData = days.map(day => {
            const dayTasks = getTasksForDate(day);
            return {
                date: format(day, 'yyyy-MM-dd'),
                dayName: format(day, 'EEEE'),
                tasks: dayTasks.map(task => ({
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate
                }))
            };
        });

        const csvContent = [
            ['Date', 'Day', 'Task Title', 'Status', 'Priority', 'Due Date'],
            ...calendarData.flatMap(day => 
                day.tasks.map(task => [
                    day.date,
                    day.dayName,
                    task.title,
                    task.status,
                    task.priority,
                    task.dueDate
                ])
            )
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar-${format(currentDate, 'MMMM-yyyy')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getDayClassName = (day) => {
        const dayTasks = getTasksForDate(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isCurrentDay = isToday(day);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        
        let baseClasses = 'min-h-32 p-2 rounded-lg border transition-all duration-200 hover:shadow-md flex flex-col ';
        
        if (isSelected) {
            baseClasses += 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 border-purple-400 dark:border-purple-500 shadow-md ';
        } else if (isCurrentDay) {
            baseClasses += 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-300 dark:border-purple-600 ';
        } else {
            baseClasses += 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 ';
        }

        if (!isCurrentMonth) {
            baseClasses += 'opacity-40 ';
        }

        // Add indication for overdue tasks
        const hasOverdueTasks = dayTasks.some(isOverdue);
        if (hasOverdueTasks) {
            baseClasses += 'ring-1 ring-red-300 dark:ring-red-700 ';
        }

        return baseClasses;
    };

    const stats = getTaskStats();

    return (
        <div className="card p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {viewMode === 'month' 
                                ? format(currentDate, 'MMMM yyyy') 
                                : `Week of ${format(currentDate, 'MMM d, yyyy')}`
                            }
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.total} tasks total • {stats.today} due today
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                viewMode === 'month' 
                                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                viewMode === 'week' 
                                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                        >
                            Week
                        </button>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="pending">Pending</option>
                        </select>
                        <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrev}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={viewMode === 'month' ? 'Previous month' : 'Previous week'}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={viewMode === 'month' ? 'Next month' : 'Next week'}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={exportCalendar}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.completed}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.inProgress}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">In Progress</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.pending}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pending</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.overdue}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overdue</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <CalendarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.today}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Today</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.upcoming}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tomorrow</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</p>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map(day => {
                    const dayTasks = getTasksForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onDateSelect(day)}
                            className={getDayClassName(day)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <span className={`text-sm font-medium ${
                                        isSelected
                                            ? 'text-purple-700 dark:text-purple-300 font-bold'
                                            : isCurrentDay 
                                            ? 'text-purple-700 dark:text-purple-300' 
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {format(day, 'd')}
                                    </span>
                                    {!isCurrentMonth && (
                                        <span className="text-xs text-gray-400 ml-1">
                                            ({format(day, 'MMM')})
                                        </span>
                                    )}
                                </div>
                                {dayTasks.length > 0 && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>
                            
                            <div className="space-y-1 flex-1 overflow-y-auto">
                                {dayTasks.slice(0, 3).map(task => {
                                    const overdue = isOverdue(task);
                                    const upcoming = isUpcoming(task);
                                    
                                    return (
                                        <div
                                            key={task._id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTaskSelect && onTaskSelect(task);
                                            }}
                                            className={`text-xs p-1.5 rounded truncate flex items-center space-x-1 cursor-pointer hover:opacity-90 transition-opacity ${
                                                overdue
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    : task.status === 'completed' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                                    : task.status === 'in-progress'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            } ${getPriorityColor(task.priority)}`}
                                            title={`${task.title} - ${task.priority} priority - ${overdue ? 'Overdue!' : ''}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                                            <span className="truncate">{task.title}</span>
                                            {overdue && <span className="ml-auto text-xs">⚠️</span>}
                                            {upcoming && !overdue && <span className="ml-auto text-xs">⏰</span>}
                                        </div>
                                    );
                                })}
                                {dayTasks.length > 3 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                                        +{dayTasks.length - 3} more
                                    </div>
                                )}
                                {dayTasks.length === 0 && isCurrentDay && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500 italic text-center pt-4">
                                        No tasks today
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Legend */}
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"></h4>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">In Progress</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCalendar;