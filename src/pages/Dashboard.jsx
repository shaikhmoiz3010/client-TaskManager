import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContent';
import { useDarkMode } from '../contexts/DarkModeContext';
import { taskService } from '../services/api';
import Header from '../components/layout/Header';
import TaskForm from '../components/tasks/TaskForm';
import TaskList from '../components/tasks/TaskList';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskCalendar from '../components/tasks/TaskCalendar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import {
    Plus,
    CheckCircle,
    Clock,
    TrendingUp,
    Calendar,
    BarChart3,
    Sparkles,
    Download,
    Filter,
    Zap,
    Activity,
    Rocket,
    Target as TargetIcon,
    BarChart,
    PieChart as PieChartIcon,
    CalendarDays,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const { darkMode } = useDarkMode();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        overdue: 0
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [activeTab, setActiveTab] = useState('tasks');
    const [isCalendarTaskModalOpen, setIsCalendarTaskModalOpen] = useState(false);
    const [selectedCalendarTask, setSelectedCalendarTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, [filters]);

    useEffect(() => {
        calculateStats();
    }, [tasks]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getTasks(filters);
            setTasks(response.data.tasks);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleCalendarTaskSelect = (task) => {
        console.log('Task selected from calendar:', task);
        setSelectedCalendarTask(task);
        setIsCalendarTaskModalOpen(true);
    };

    const generateAnalyticsData = (tasks) => {
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return format(date, 'MMM dd');
        }).reverse();

        return last7Days.map(date => {
            const completed = tasks.filter(task => {
                if (!task.completedAt) return false;
                return format(new Date(task.completedAt), 'MMM dd') === date;
            }).length;

            const created = tasks.filter(task => {
                return format(new Date(task.createdAt), 'MMM dd') === date;
            }).length;

            const pending = tasks.filter(task => {
                return format(new Date(task.createdAt), 'MMM dd') === date && task.status === 'pending';
            }).length;

            return { date, completed, created, pending };
        });
    };

    const generatePriorityData = (tasks) => {
        const priorityCount = {
            high: tasks.filter(task => task.priority === 'high').length,
            medium: tasks.filter(task => task.priority === 'medium').length,
            low: tasks.filter(task => task.priority === 'low').length
        };

        return [
            { name: 'High', value: priorityCount.high, color: '#ef4444' },
            { name: 'Medium', value: priorityCount.medium, color: '#f59e0b' },
            { name: 'Low', value: priorityCount.low, color: '#10b981' }
        ];
    };

    const generateStatusData = (tasks) => {
        return [
            { name: 'Completed', value: stats.completed, color: '#10b981' },
            { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
            { name: 'Pending', value: stats.pending, color: '#f59e0b' }
        ];
    };

    const calculateProductivityScore = (tasks) => {
        if (tasks.length === 0) return 0;

        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const highPriorityCompleted = tasks.filter(task =>
            task.status === 'completed' && task.priority === 'high'
        ).length;

        const today = new Date();
        const overdueTasks = tasks.filter(task =>
            task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed'
        ).length;

        let score = (completedTasks / tasks.length) * 70;
        score += (highPriorityCompleted / Math.max(completedTasks, 1)) * 20;
        score -= overdueTasks * 10;

        return Math.min(Math.max(Math.round(score), 0), 100);
    };

    const calculateStats = () => {
        const total = pagination.total || 0;
        const completed = tasks.filter(task => task.status === 'completed').length;
        const pending = tasks.filter(task => task.status === 'pending').length;
        const inProgress = tasks.filter(task => task.status === 'in-progress').length;
        const today = new Date();
        const overdue = tasks.filter(task =>
            task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed'
        ).length;

        setStats({ total, completed, pending, inProgress, overdue });
    };

    const handleCreateTask = async (taskData) => {
        try {
            await taskService.createTask(taskData);
            toast.success('Task created successfully');
            setShowForm(false);
            fetchTasks();
        } catch (error) {
            toast.error('Failed to create task');
        }
    };

    const handleUpdateTask = async (taskData) => {
        try {
            await taskService.updateTask(editingTask._id, taskData);
            toast.success('Task updated successfully');
            setEditingTask(null);
            setShowForm(false);
            fetchTasks();
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await taskService.deleteTask(taskId);
            toast.success('Task deleted successfully');
            fetchTasks();
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const handleEditTask = (task) => {
        console.log('Edit task clicked:', task);
        setEditingTask(task);
        setShowForm(true);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            priority: '',
            search: '',
            page: 1,
            limit: 10
        });
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        handleFilterChange({
            dueDate: format(date, 'yyyy-MM-dd')
        });
    };

    const exportTasks = () => {
        const csvContent = [
            ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Tags', 'Created At'],
            ...tasks.map(task => [
                task.title,
                task.description || '',
                task.status,
                task.priority,
                task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
                task.tags?.join(', ') || '',
                format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss')
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Tasks exported successfully');
    };

    const getCompletionPercentage = () => {
        return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    };

    const getProductivityLevel = (score) => {
        if (score >= 80) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600', bgLight: 'bg-green-100 dark:bg-green-900/20' };
        if (score >= 60) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600', bgLight: 'bg-blue-100 dark:bg-blue-900/20' };
        if (score >= 40) return { label: 'Average', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-gradient-to-r from-yellow-500 to-amber-600', bgLight: 'bg-yellow-100 dark:bg-yellow-900/20' };
        return { label: 'Needs Improvement', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-gradient-to-r from-red-500 to-rose-600', bgLight: 'bg-red-100 dark:bg-red-900/20' };
    };

    const StatCard = ({ icon: Icon, label, value, color, subtitle, trend, onClick }) => {
        const productivityLevel = label === 'Productivity' ? getProductivityLevel(value) : null;
        
        return (
            <div 
                className="group relative cursor-pointer transition-all duration-300"
                onClick={onClick}
            >
                <div className="relative bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-800/90 dark:to-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`relative p-3 rounded-xl ${color.replace('text-', 'bg-')} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                                <p className={`text-2xl font-bold ${productivityLevel?.color || 'text-gray-900 dark:text-white'}`}>
                                    {label === 'Productivity' ? `${value}%` : value}
                                </p>
                                {subtitle && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                                )}
                                {productivityLevel && (
                                    <span className={`text-xs px-3 py-1 rounded-full mt-2 bg-gradient-to-r ${productivityLevel.bgColor} text-white`}>
                                        {productivityLevel.label}
                                    </span>
                                )}
                            </div>
                        </div>
                        {trend && (
                            <div className={`flex items-center text-xs font-medium px-3 py-1.5 rounded-full ${trend.color}`}>
                                {trend.icon && <trend.icon className="w-3 h-3 mr-1" />}
                                {trend.value}
                            </div>
                        )}
                    </div>
                    {label === 'Completed' && stats.total > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{getCompletionPercentage()}%</span>
                            </div>
                            <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out shadow-lg shadow-green-500/25"
                                    style={{ width: `${getCompletionPercentage()}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    {label === 'Productivity' && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>Score</span>
                                <span>{value}%</span>
                            </div>
                            <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out shadow-lg shadow-purple-500/25"
                                    style={{ width: `${value}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const QuickActionButton = ({ icon: Icon, label, onClick, variant = 'outline', badge }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${variant === 'primary'
                    ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-white/30 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
        >
            <div className={`relative p-2 rounded-lg ${variant === 'primary' ? 'bg-white/20' : 'bg-purple-50 dark:bg-purple-900/30'}`}>
                <Icon className={`w-4 h-4 ${variant === 'primary' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
            </div>
            <span className="font-medium text-sm ml-3">{label}</span>
            {badge && (
                <span className="ml-auto text-xs bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                    {badge}
                </span>
            )}
            <ChevronRight className={`w-4 h-4 ml-2 ${variant === 'primary' ? 'text-white/70' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
        </button>
    );

    const TabButton = ({ active, icon: Icon, label, onClick, badge }) => (
        <button
            onClick={onClick}
            className={`flex items-center px-5 py-3 rounded-xl transition-all duration-200 relative group ${active
                    ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm'
                }`}
        >
            <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-purple-50 dark:bg-purple-900/30'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium ml-3">{label}</span>
            {badge && (
                <span className={`ml-2 text-xs px-2.5 py-1 rounded-full ${active
                        ? 'bg-white/30 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    {badge}
                </span>
            )}
            {!active && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            )}
        </button>
    );

    const analyticsData = generateAnalyticsData(tasks);
    const priorityData = generatePriorityData(tasks);
    const statusData = generateStatusData(tasks);
    const productivityScore = calculateProductivityScore(tasks);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Header />

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">

                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
                                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{user?.name}</span>!
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                                        <CalendarDays className="w-4 h-4 mr-2" />
                                        {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>
                            <div className="relative bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-2xl p-4 mt-4 border border-white/30 dark:border-white/10">
                                <Sparkles className="absolute top-4 right-4 w-5 h-5 text-purple-500 dark:text-purple-400" />
                                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
                                    {stats.completed > 0 
                                        ? `🎉 Amazing work! You've completed ${stats.completed} tasks. Keep up the momentum!`
                                        : '🚀 Ready to conquer your tasks? Start by creating your first task!'}
                                </p>

                                {/* Daily Progress */}
                                {stats.total > 0 && (
                                    <div className="mt-4 max-w-md">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <span className="font-medium">Daily Progress</span>
                                            <span className="font-semibold text-purple-600 dark:text-purple-400">{getCompletionPercentage()}% Complete</span>
                                        </div>
                                        <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full h-3 shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-purple-500/25"
                                                style={{ width: `${getCompletionPercentage()}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setEditingTask(null);
                                    setShowForm(true);
                                }}
                                className="group relative bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                                <span>Create New Task</span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                            <button
                                onClick={exportTasks}
                                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-white/30 dark:border-gray-700/50 px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <Download className="w-5 h-5" />
                                <span>Export</span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-white/30 dark:border-white/10">
                        <TabButton
                            active={activeTab === 'tasks'}
                            icon={CheckCircle}
                            label="Tasks"
                            onClick={() => setActiveTab('tasks')}
                            badge={stats.total}
                        />
                        <TabButton
                            active={activeTab === 'analytics'}
                            icon={BarChart3}
                            label="Analytics"
                            onClick={() => setActiveTab('analytics')}
                        />
                        <TabButton
                            active={activeTab === 'calendar'}
                            icon={Calendar}
                            label="Calendar"
                            onClick={() => setActiveTab('calendar')}
                        />
                    </div>
                </div>

                {activeTab === 'tasks' ? (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Stats Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                                        Overview
                                    </h2>
                                    <span className="text-xs text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 px-3 py-1.5 rounded-full">
                                        Live
                                    </span>
                                </div>

                                <StatCard
                                    icon={TrendingUp}
                                    label="Total Tasks"
                                    value={stats.total}
                                    color="text-blue-600 dark:text-blue-400"
                                    subtitle="All tasks"
                                    onClick={() => clearFilters()}
                                />

                                <StatCard
                                    icon={CheckCircle}
                                    label="Completed"
                                    value={stats.completed}
                                    color="text-green-600 dark:text-green-400"
                                    subtitle={`${getCompletionPercentage()}% done`}
                                    onClick={() => handleFilterChange({ status: 'completed' })}
                                />

                                <StatCard
                                    icon={Clock}
                                    label="In Progress"
                                    value={stats.inProgress}
                                    color="text-blue-600 dark:text-blue-400"
                                    subtitle="Active work"
                                    onClick={() => handleFilterChange({ status: 'in-progress' })}
                                />



  
                            </div>

                            {/* Quick Actions */}
                            <div className="relative bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-800/90 dark:to-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 -z-10"></div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    <QuickActionButton
                                        icon={Plus}
                                        label="Add New Task"
                                        onClick={() => {
                                            setEditingTask(null);
                                            setShowForm(true);
                                        }}
                                        variant="primary"
                                    />
                                    <QuickActionButton
                                        icon={CheckCircle}
                                        label="View Completed"
                                        onClick={() => handleFilterChange({ status: 'completed' })}
                                        badge={stats.completed}
                                    />
                                    <QuickActionButton
                                        icon={Clock}
                                        label="In Progress Tasks"
                                        onClick={() => handleFilterChange({ status: 'in-progress' })}
                                        badge={stats.inProgress}
                                    />
                                    <QuickActionButton
                                        icon={Filter}
                                        label="High Priority"
                                        onClick={() => handleFilterChange({ priority: 'high' })}
                                        badge={priorityData.find(p => p.name === 'High')?.value || 0}
                                    />
                                    <QuickActionButton
                                        icon={TrendingUp}
                                        label="View All Tasks"
                                        onClick={clearFilters}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="xl:col-span-3">
                            {showForm ? (
                                <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl animate-fade-in">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 -z-10"></div>
                                    
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {editingTask ? 'Edit Task' : 'Create New Task'}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                {editingTask ? 'Update your task details' : 'Add a new task to your list'}
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                                                <Plus className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                                        </div>
                                    </div>
                                    <TaskForm
                                        task={editingTask}
                                        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                                        onCancel={() => {
                                            setShowForm(false);
                                            setEditingTask(null);
                                        }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <TaskFilters
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                    />

                                    <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden">
                                        <div className="relative bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-white/30 dark:border-gray-700/50 px-6 py-4">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between relative">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Your Tasks
                                                        {stats.total > 0 && (
                                                            <span className="text-purple-600 dark:text-purple-400 ml-2">
                                                                ({stats.total})
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                        Manage all your tasks in one place
                                                    </p>
                                                </div>
                                                {stats.total > 0 && (
                                                    <div className="mt-2 sm:mt-0 flex items-center space-x-4">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Page {pagination.current} of {pagination.pages}
                                                        </div>
                                                        <button
                                                            onClick={exportTasks}
                                                            className="group flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg transition-all duration-200"
                                                        >
                                                            <Download className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform duration-200" />
                                                            Export
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <TaskList
                                            tasks={tasks}
                                            loading={loading}
                                            onEdit={handleEditTask}
                                            onDelete={handleDeleteTask}
                                            pagination={pagination}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'analytics' ? (
                    <div className="space-y-6">
                        {/* Analytics Header */}
                        <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-lg p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">Track your productivity and task patterns</p>
                                </div>
                                <div className="mt-4 lg:mt-0">
                                    <select className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent">
                                        <option>Last 7 days</option>
                                        <option>Last 30 days</option>
                                        <option>Last 90 days</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Task Completion Chart */}
                            <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg mr-3">
                                        <BarChart className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Task Completion Trend
                                    </h3>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analyticsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                                            <XAxis dataKey="date" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                                    border: 'none',
                                                    borderRadius: '0.75rem',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                                }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="completed"
                                                stroke="#10B981"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Completed"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="created"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Created"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="pending"
                                                stroke="#F59E0B"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Pending"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Priority Distribution */}
                            <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mr-3">
                                        <PieChartIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Priority Distribution
                                    </h3>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={priorityData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {priorityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [`${value} tasks`, 'Count']}
                                                contentStyle={{
                                                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                                    border: 'none',
                                                    borderRadius: '0.75rem',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Calendar Header */}
                        <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-lg p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Calendar</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">Visualize your tasks on a calendar view</p>
                                </div>
                            </div>
                        </div>

                        {/* Calendar View */}
                        <TaskCalendar 
                            tasks={tasks} 
                            onDateSelect={handleDateSelect}
                            onTaskSelect={handleCalendarTaskSelect}
                            selectedDate={selectedDate}
                        />
                    </div>
                )}
            </main>

            {/* Calendar Task Edit Modal */}
            {isCalendarTaskModalOpen && selectedCalendarTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/30 dark:border-white/10 shadow-2xl">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 -z-10"></div>
                        
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Edit Task
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedCalendarTask.title}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsCalendarTaskModalOpen(false);
                                        setSelectedCalendarTask(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                                >
                                    <span className="text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">×</span>
                                </button>
                            </div>
                            
                            <TaskForm
                                task={selectedCalendarTask}
                                onSubmit={async (formData) => {
                                    try {
                                        await taskService.updateTask(selectedCalendarTask._id, formData);
                                        toast.success('Task updated successfully');
                                        setIsCalendarTaskModalOpen(false);
                                        setSelectedCalendarTask(null);
                                        fetchTasks();
                                    } catch (error) {
                                        toast.error('Failed to update task');
                                    }
                                }}
                                onCancel={() => {
                                    setIsCalendarTaskModalOpen(false);
                                    setSelectedCalendarTask(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;