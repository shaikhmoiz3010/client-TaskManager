import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Flag, 
  Tag, 
  AlertCircle, 
  X,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Plus,
  Edit3,
  Save
} from 'lucide-react';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags?.join(', ') || ''
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    onSubmit(submitData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'from-yellow-500 to-amber-600';
      case 'in-progress': return 'from-blue-500 to-blue-600';
      case 'completed': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-yellow-500 to-amber-600';
      case 'high': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in-progress': return TrendingUp;
      case 'completed': return CheckCircle;
      default: return Target;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low': return Flag;
      case 'medium': return AlertTriangle;
      case 'high': return Zap;
      default: return Flag;
    }
  };

  const InputField = ({ label, name, type = 'text', required = false, icon: Icon, placeholder, ...props }) => {
    const isError = errors[name];
    
    return (
      <div className="relative">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
          {Icon && (
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
              isError ? 'text-red-500' : 'text-purple-500 group-hover:text-purple-600 dark:text-purple-400'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${
              isError 
                ? 'border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500/50' 
                : 'border-white/30 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 focus:ring-2 focus:ring-purple-500/50'
            } rounded-xl focus:outline-none focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${Icon ? 'pl-12' : 'pl-4'}`}
            required={required}
            placeholder={placeholder}
            {...props}
          />
          {isError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
            </div>
          )}
        </div>
        {isError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center animate-fade-in">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  const SelectField = ({ label, name, options, icon: Icon, gradientColor }) => {
    const SelectedIcon = name === 'status' ? getStatusIcon(formData[name]) : 
                         name === 'priority' ? getPriorityIcon(formData[name]) : 
                         Icon;
    const gradient = name === 'status' ? getStatusColor(formData[name]) : 
                     name === 'priority' ? getPriorityColor(formData[name]) : 
                     gradientColor || 'from-purple-500 to-purple-600';
    
    return (
      <div className="relative">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {label}
        </label>
        <div className="relative group">
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200`}>
            <SelectedIcon className="h-5 w-5 text-purple-500 group-hover:text-purple-600 dark:text-purple-400" />
          </div>
          <select
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="w-full pl-12 pr-10 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-gray-900 dark:text-white appearance-none cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
          >
            {options.map(option => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {/* Selected value indicator */}
          <div className={`absolute right-10 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title Input */}
      <div className="relative">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Task Title <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${
              errors.title 
                ? 'border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500/50' 
                : 'border-white/30 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 focus:ring-2 focus:ring-purple-500/50'
            } rounded-xl focus:outline-none focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
            required
            placeholder="Enter a descriptive task title..."
            maxLength={100}
          />
          {errors.title && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
            </div>
          )}
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {formData.title.length}/100
          </div>
        </div>
        {errors.title && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center animate-fade-in">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="relative">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <div className="relative group">
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${
              errors.description 
                ? 'border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500/50' 
                : 'border-white/30 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 focus:ring-2 focus:ring-purple-500/50'
            } rounded-xl focus:outline-none focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none`}
            placeholder="Describe your task in detail..."
            maxLength={500}
          />
          {errors.description && (
            <div className="absolute top-3 right-3">
              <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
            </div>
          )}
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {formData.description.length}/500
          </div>
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            {/* <Sparkles className="w-4 h-4 mr-1 text-purple-500" /> */}
            Optional
          </span>
          <span>Characters</span>
        </div>
        {errors.description && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center animate-fade-in">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Status, Priority, Due Date Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SelectField
          label="Status"
          name="status"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' }
          ]}
        />

        <SelectField
          label="Priority"
          name="priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]}
        />

        <div className="relative">
          <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Due Date
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-purple-500 group-hover:text-purple-600 dark:text-purple-400 transition-colors duration-200" />
            </div>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-gray-900 dark:text-white hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Clock className="w-4 h-4 mr-1 text-purple-500" />
            Optional
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="relative">
        <label htmlFor="tags" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Tags
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-purple-500 group-hover:text-purple-600 dark:text-purple-400 transition-colors duration-200" />
          </div>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
            placeholder="work, personal, urgent, important..."
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <Sparkles className="w-4 h-4 mr-1 text-purple-500" />
          Separate tags with commas
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-8 border-t border-white/30 dark:border-gray-700/50">
        <button
          type="button"
          onClick={onCancel}
          className="group relative px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-white dark:hover:bg-gray-700/80 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <X className="w-4 h-4 mr-2 inline-block group-hover:rotate-90 transition-transform duration-200" />
          Cancel
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </button>
        <button
          type="submit"
          className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
        >
          {task ? (
            <>
              <Save className="w-4 h-4 mr-2 inline-block group-hover:scale-110 transition-transform duration-200" />
              Update Task
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2 inline-block group-hover:rotate-90 transition-transform duration-200" />
              Create Task
            </>
          )}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </form>
  );
};

export default TaskForm;