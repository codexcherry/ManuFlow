import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Mail, ArrowLeft } from 'lucide-react';
import { validateEmail } from '../utils/helpers';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // In a real application, this would call an API endpoint to send a password reset email
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Reset Your Password</h1>
          <p className="text-gray-600 mt-2">
            {!emailSent 
              ? 'Enter your email address and we will send you instructions to reset your password' 
              : 'Check your email for instructions to reset your password'}
          </p>
        </div>

        {!emailSent ? (
          <>
            {/* Forgot password form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
                  <p>{error}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="spinner mr-2"></div>
                ) : null}
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          </>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-5 rounded-lg mb-6 text-center">
            <p className="font-medium">Email sent!</p>
            <p className="mt-2">
              We've sent password reset instructions to {email}. Please check your inbox.
            </p>
          </div>
        )}

        {/* Back to login link */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
