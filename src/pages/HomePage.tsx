import React from 'react';
import MainLayout from '../layouts/MainLayout';

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <h1 className="text-2xl font-bold mb-6 text-white">Movie Search</h1>
        <div className="w-full max-w-md px-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for movies or TV shows..."
              className="w-full px-4 py-3 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-24"
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-full text-white text-sm transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage; 