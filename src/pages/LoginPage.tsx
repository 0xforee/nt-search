import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { LoginCredentials } from '../types';

const validationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    message: 'Username is required',
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password is required',
  },
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, isLoading } = useAuth();
  const { errors, isValid, validateForm } = useFormValidation(validationRules);
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-8 text-white text-center">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className={`w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.username ? 'border-red-500' : ''
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>
          <div className="relative">
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.password ? 'border-red-500' : ''
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          {authError && (
            <p className="text-sm text-red-500 text-center">{authError}</p>
          )}
          <button 
            type="submit"
            disabled={isLoading || !isValid}
            className={`w-full bg-blue-500 text-white py-3 rounded-lg text-sm font-medium transition-colors ${
              (isLoading || !isValid) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <div className="text-center">
            <a href="#" className="text-blue-500 text-sm hover:text-blue-400">Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 