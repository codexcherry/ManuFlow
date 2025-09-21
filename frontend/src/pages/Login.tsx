import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Eye, EyeOff, LogIn, HelpCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.username, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.errorMessage || 'Invalid Login ID or Password');
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 relative overflow-hidden">
        {/* Background light effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-100 rounded-full opacity-50"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gray-100 rounded-full opacity-40"></div>
        <div className="relative z-10">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to ManuFlow</h1>
          <p className="text-gray-600 mt-2">Sign in to your manufacturing management account</p>
        </div>


        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="spinner mr-2"></div>
            ) : (
              <LogIn className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register and Forgot Password links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
            >
              Sign up here
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <Link
              to="/forgot-password"
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200 flex items-center justify-center"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Forgot Password?
            </Link>
          </p>
        </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
