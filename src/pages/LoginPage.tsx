import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-8 text-white text-center">Welcome Back</h1>
        <div className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Username"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Password"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-sm font-medium transition-colors">
            Login
          </button>
          <div className="text-center">
            <a href="#" className="text-blue-500 text-sm hover:text-blue-400">Forgot Password?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 