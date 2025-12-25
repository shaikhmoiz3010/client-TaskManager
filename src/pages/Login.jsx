// Enhanced Login Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContent';
import { useDarkMode } from '../contexts/DarkModeContext';
import toast from 'react-hot-toast';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn,
  Sparkles,
  Shield,
  UserPlus,
  Key,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto px-4">
        <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl p-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 -z-10"></div>
          
          <div className="text-center mb-8">

            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Email Address
                </div>
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="you@example.com"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Password
                </div>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 pr-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500 dark:text-purple-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-6 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-200" />
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-200" />
                </>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30 dark:border-gray-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-500 dark:text-gray-400 rounded-lg">
                  New here?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="group inline-flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                Create New Account
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;