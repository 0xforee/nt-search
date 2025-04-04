import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDownload } from '../context/DownloadContext';
import MainLayout from '../layouts/MainLayout';
import { apiRequest } from '../services/api';

interface TorrentResource {
  id: number;
  seeders: number;
  enclosure: string;
  site: string;
  torrent_name: string;
  description: string;
  pageurl: string;
  uploadvalue: number;
  downloadvalue: number;
  size: string;
  respix: string;
  restype: string;
  reseffect: string;
  releasegroup: string;
  video_encode: string;
  labels: string[];
}

interface MovieData {
  key: number;
  title: string;
  year: string;
  type_key: string;
  image: string;
  type: string;
  vote: string;
  tmdbid: string;
  backdrop: string;
  poster: string;
  overview: string;
  fav: string;
  rssid: string;
  torrent_dict: TorrentResource[];
}

interface SearchKeywordResponse {
  code: number;
  success: boolean;
  message: string;
  data: any;
}

interface SearchResultResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    total: number;
    result: {
      [key: string]: MovieData;
    }
  }
}



const MovieResourcesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { startDownload } = useDownload();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [resources, setResources] = useState<TorrentResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movieTitle, setMovieTitle] = useState<string>('');

  useEffect(() => {
    const fetchMovieResources = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Check if movie data was passed via location state
        const passedMovie = location.state?.movie;
        
        if(!passedMovie && !id) {
          throw new Error('Movie ID is required');
        }

        // Use the movie data passed from the previous page
        setMovieTitle(passedMovie.title);
        
        // Now use the title to search for resources
        const searchParams = {
          search_word: passedMovie.title
        };

        // First API call to /search/keyword with 30s timeout
        const searchResponse = await apiRequest<SearchKeywordResponse>('/search/keyword', {
          method: 'POST',
          urlEncoded: true,
          body: searchParams,
          timeout: 30000 // 30 seconds timeout
        });

        if (!searchResponse.success) {
          throw new Error(searchResponse.message || 'Search failed');
        }

        // Second API call to /search/result to get the actual results
        const resultsResponse = await apiRequest<SearchResultResponse>('/search/result', {
          method: 'POST',
          urlEncoded: true,
          body: {}
        });

        if (!resultsResponse.success) {
          throw new Error(resultsResponse.message || 'Failed to fetch search results');
        }

        // Process the results
        const results = resultsResponse.data.result;
        const movieKeys = Object.keys(results);

        if (movieKeys.length > 0) {
          const firstMovieKey = movieKeys[0];
          const movieData = results[firstMovieKey];
          setMovie(movieData);

          // Extract torrent resources
          if (movieData.torrent_dict) {
            // Handle nested structure as shown in the sample response
            const torrents: TorrentResource[] = [];
            
            // Process the nested torrent_dict structure
            if (Array.isArray(movieData.torrent_dict)) {
              // Format: [['MOV', {...}]]
              movieData.torrent_dict.forEach((item: any) => {
                if (Array.isArray(item) && item.length > 1) {
                  const [mediaType, resolutions] = item;
                  
                  // Iterate through each resolution type (1080p_bluray, 2160p_, etc.)
                  Object.values(resolutions).forEach((resolution: any) => {
                    // Check if group_torrents exists
                    if (resolution.group_torrents) {
                      // Iterate through each group in group_torrents
                      Object.values(resolution.group_torrents).forEach((torrentGroup: any) => {
                        // Extract torrents from torrent_list
                        if (torrentGroup.torrent_list && Array.isArray(torrentGroup.torrent_list)) {
                          torrentGroup.torrent_list.forEach((torrent: TorrentResource) => {
                            torrents.push(torrent);
                          });
                        }
                      });
                    }
                  });
                }
              });
            } else {
              // Alternative structure handling
              Object.entries(movieData.torrent_dict).forEach(([_, typeData]: [string, any]) => {
                if (Array.isArray(typeData)) {
                  typeData.forEach((item: any) => {
                    if (Array.isArray(item) && item.length > 1) {
                      const [_, resolutions] = item;
                      
                      Object.values(resolutions).forEach((resolution: any) => {
                        Object.values(resolution.group_torrents).forEach((torrentGroup: any) => {
                          torrentGroup.torrent_list.forEach((torrent: TorrentResource) => {
                            torrents.push(torrent);
                          });
                        });
                      });
                    }
                  });
                }
              });
            }
            
            setResources(torrents);
          }
        } else {
          setError('No resources found for this movie');
        }
        
      } catch (err) {
        setError('Failed to load resources. Please try again.');
        console.error('Movie resources error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieResources();
  }, [id, searchParams, location.state]);

  const handleDownload = async (resource: TorrentResource) => {
    try {
      // Show loading state
      setIsLoading(true);
      
      // Start the download using the API service
      await startDownload(resource.id.toString(), id || '');
      
      // Navigate to downloads page
      navigate('/downloads');
    } catch (err) {
      console.error('Download error:', err);
      // Show error message to user
      setError('Failed to start download. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <span className="text-white">Loading resources...</span>
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
    <MainLayout title={`Resources for "${movie.title}"`}>
      <div className="container mx-auto px-4 py-8">
        {/* Movie Header */}
        <div className="relative mb-8">
          <img 
            src={movie.image} 
            alt={movie.title}
            className="w-full h-[200px] object-cover rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-32 rounded-b-lg"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h1 className="text-xl font-bold text-white mb-1">{movie.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.type}</span>
              <span>•</span>
              <span className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">{movie.vote}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold mb-4">Available Resources</h2>
          
          {resources.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No resources available for this movie
            </div>
          ) : (
            resources.map((resource) => (
              <div key={resource.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm">{resource.torrent_name}</p>
                    <p className="text-gray-400 text-xs mt-1">{resource.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-gray-400 text-xs">{resource.respix}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{resource.video_encode}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{resource.size}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{resource.seeders} seeders</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(resource)}
                    className="bg-blue-500 text-white text-xs px-3 py-1 rounded ml-2 hover:bg-blue-600 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MovieResourcesPage;