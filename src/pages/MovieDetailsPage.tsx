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
    <MainLayout title={movie.title}>
      <div className="relative">
        {/* Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 h-[500px] bg-cover bg-center w-full" 
          style={{ 
            backgroundImage: `url(${movie.background[0] || movie.image})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-900"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 md:px-8 relative">
          {/* Movie Header */}
          <div className="pt-32 pb-16">
            <div className="max-w-4xl">
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">{movie.title}</h1>
              <div className="flex items-center space-x-6 mb-6">
                <span className="text-gray-200 text-lg">{movie.year}</span>
                <span className="text-yellow-400 text-lg font-semibold">★ {movie.vote}</span>
                <span className="text-gray-200 text-lg">{movie.genres}</span>
              </div>
              <p className="text-gray-100 text-xl leading-relaxed mb-8 drop-shadow-md">{movie.overview}</p>
            
            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {movie.fact.map((fact, index) => (
                <div key={index} className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="text-gray-300 text-sm font-medium">{Object.keys(fact)[0]}</h3>
                  <p className="text-white text-base">{Object.values(fact)[0]}</p>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <button 
              onClick={() => navigate(`/movie/${id}/resources?type=${searchParams.get('type') || 'MOV'}`)}              className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-lg font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              View Resources
            </button>
          </div>
        </div>
      </div>

        {/* Content Sections */}
        <div className="container mx-auto px-8 py-12 bg-gray-900">
          {/* Cast Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
            <div className="flex overflow-x-auto space-x-6 pb-6">
              {movie.actors.slice(0, 10).map((actor) => (
                <div key={actor.id} className="flex-none text-center w-32">
                  <div className="w-28 h-28 mx-auto relative mb-3">
                    <img 
                      src={actor.image} 
                      alt={actor.name}
                      className="w-full h-full object-cover rounded-full border-2 border-gray-700 hover:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="w-full">
                    <h3 className="text-white text-base font-medium truncate">{actor.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{actor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crew Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Crew</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movie.crews.map((crew, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-800 transition-colors">
                  <h3 className="text-white text-lg font-medium mb-2">{Object.keys(crew)[0]}</h3>
                  <p className="text-gray-300 text-base">{Object.values(crew)[0]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Background Images */}
          {movie.background.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Background Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movie.background.map((bg, index) => (
                  <div key={index} className="relative h-60 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300">
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
      </div>
    </MainLayout>
  );
};

export default MovieDetailsPage;