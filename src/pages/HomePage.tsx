import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.username}!</h1>
          <p className="text-gray-400">Search for your favorite movies and TV shows</p>
        </div>
        
        <div className="w-full max-w-2xl px-4">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies or TV shows..."
              className="w-full px-6 py-4 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base pr-32"
            />
            <button 
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 px-6 py-2 rounded-full text-white text-sm font-medium transition-colors ${
                (isSearching || !searchQuery.trim()) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-600'
              }`}
            >
              {isSearching ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage; 