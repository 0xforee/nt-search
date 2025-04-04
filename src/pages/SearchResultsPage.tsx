import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { SearchResponse } from '../types';
import { apiRequest } from '../services/api';
import { useSearch } from '../context/SearchContext';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { searchResults, setSearchResults } = useSearch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      setIsLoading(true);
      setError(null);

      try {
        // Using apiRequest from the API service instead of direct fetch
        const searchParams = {
          type: 'SEARCH',
          subtype: '',
          page: '1',
          keyword: query
        };

        const data = await apiRequest<SearchResponse>('/recommend/list', {
          method: 'POST',
          urlEncoded: true,
          body: searchParams
        });
        
        if (!data.success) {
          throw new Error(data.message || 'Search failed');
        }

        setSearchResults(data.data.Items);
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleMovieClick = (id: number, media_type: string) => {
    const mediaType = media_type === '动漫' || media_type === '电视剧' ? 'TV' : 'MOV';
    navigate(`/movie/${id}?type=${mediaType}`);
  };

  if (isLoading) {
    return (
      <MainLayout title={`Search Results for "${query}"`}>
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
      <MainLayout title={`Search Results for "${query}"`}>
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
        {searchResults.length === 0 ? (
          <div className="text-center text-gray-400">
            No results found for "{query}"
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {searchResults.map((result) => (
              <div 
                key={result.id}
                onClick={() => handleMovieClick(result.id, result.media_type)}
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