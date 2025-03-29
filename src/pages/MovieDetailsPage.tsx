import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { MovieDetails } from '../types';

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const mediaType = searchParams.get('type') || 'MOV';

        // Fetch the detailed information with the type from URL
        const formData = new URLSearchParams();
        formData.append('type', mediaType);
        formData.append('tmdbid', id);

        const response = await fetch('http://localhost:3000/api/v1/media/detail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept': 'application/json',
            'Authorization': token
          },
          body: formData.toString(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch movie details');
        }

        setMovie(data.data.data);
      } catch (err) {
        setError('Failed to load movie details. Please try again.');
        console.error('Movie details error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, searchParams]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white">Loading movie details...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !movie) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Movie not found'}</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:text-blue-400 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Search
        </button>

        {/* Movie Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Poster */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <img 
              src={movie.image} 
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-4">{movie.title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-gray-400">{movie.year}</span>
              <span className="text-yellow-500">★ {movie.vote}</span>
              <span className="text-gray-400">{movie.genres}</span>
            </div>
            <p className="text-gray-300 mb-6">{movie.overview}</p>
            
            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {movie.fact.map((fact, index) => (
                <div key={index}>
                  <h3 className="text-gray-400 text-sm">{Object.keys(fact)[0]}</h3>
                  <p className="text-white">{Object.values(fact)[0]}</p>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <div className="mt-8">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Cast</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {movie.actors.slice(0, 10).map((actor) => (
              <div key={actor.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src={actor.image} 
                  alt={actor.name}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="p-3">
                  <h3 className="text-white font-medium truncate">{actor.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{actor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crew Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Crew</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movie.crews.map((crew, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium">{Object.keys(crew)[0]}</h3>
                <p className="text-gray-400 text-sm">{Object.values(crew)[0]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Background Images */}
        {movie.background.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Background Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movie.background.map((bg, index) => (
                <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                  <img 
                    src={bg} 
                    alt={`${movie.title} background ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MovieDetailsPage; 