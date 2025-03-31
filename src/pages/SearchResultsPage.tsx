import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { SearchItem } from '../types';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const formData = new URLSearchParams();
        formData.append('type', 'SEARCH');
        formData.append('subtype', '');
        formData.append('page', '1');
        formData.append('keyword', query);

        const response = await fetch('http://localhost:3000/api/v1/recommend/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept': 'application/json',
            'Authorization': token
          },
          body: formData.toString(),
        });

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Search failed');
        }

        setResults(data.data.Items);
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleMovieClick = (id: number, type: string) => {
    const mediaType = type === '动漫' || type === '电视剧' ? 'TV' : 'MOV';
    navigate(`/movie/${id}?type=${mediaType}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white">Loading results...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Search Results for "${query}"`}>
      <div className="container mx-auto px-4 py-8">
        {results.length === 0 ? (
          <div className="text-center text-gray-400">
            No results found for "{query}"
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {results.map((result) => (
              <div 
                key={result.id}
                onClick={() => handleMovieClick(result.id, result.type)}
                className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-200 cursor-pointer shadow-lg"
              >
                <div className="relative">
                  <img 
                    src={result.poster || '/placeholder-movie.svg'} 
                    alt={result.title}
                    className="w-full aspect-[2/3] object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-movie.svg';
                    }}
                  />
                </div>
                <div className="p-3 bg-gray-800 border-t border-gray-700">
                  <h3 className="text-white text-sm font-medium truncate">{result.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-400 text-xs">{result.year || 'N/A'}</span>
                    <span className="text-yellow-500 text-xs">★ {result.vote}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-gray-400 text-xs">{result.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchResultsPage;