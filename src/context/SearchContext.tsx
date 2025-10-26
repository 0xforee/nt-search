import React, { createContext, useContext, useState } from 'react';
import { RspSearchItem } from '../services/api';
import { MovieData } from '../types';

interface SearchContextType {
  searchResults: RspSearchItem[];
  setSearchResults: (results: RspSearchItem[]) => void;
  movieResources: Record<string, MovieData>;
  setMovieResources: (movieId: string, data: MovieData) => void;
  clearSearchResults: () => void;
  clearMovieResources: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<RspSearchItem[]>([]);
  const [movieResources, setMovieResourcesState] = useState<Record<string, MovieData>>({});

  const setMovieResources = (movieId: string, data: MovieData) => {
    setMovieResourcesState(prev => ({
      ...prev,
      [movieId]: data
    }));
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  const clearMovieResources = () => {
    setMovieResourcesState({});
  };

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        setSearchResults,
        movieResources,
        setMovieResources,
        clearSearchResults,
        clearMovieResources
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};