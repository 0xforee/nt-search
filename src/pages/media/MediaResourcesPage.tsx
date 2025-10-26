import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDownload } from '../../context/DownloadContext';
import { useSearch } from '../../context/SearchContext';
import MainLayout from '../../layouts/MainLayout';
import { searchTorrentsAsync, getSearchTorrents, TorrentInfo } from '../../services/api';
import { MovieData } from '../../types';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Container,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';




const MediaResourcesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { startDownload } = useDownload();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const { setMovieResources } = useSearch();
  const [resources, setResources] = useState<TorrentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieResources = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Check if movie data was passed via location state
        const passedMovie = location.state?.movie;
        let currentMovie = passedMovie;

        if (!currentMovie && id) {
          // If no movie data passed via state, we can't proceed without it.
          // This scenario should ideally be handled by navigating from a page
          // that provides movie data (e.g., search results or movie details).
          throw new Error('Movie data not found. Please navigate from a valid movie page.');
        }
        
        if(!currentMovie) {
          throw new Error('Movie ID is required or movie data not found');
        }
        
        // Set the movie data
        setMovieResources(id, currentMovie);
        setMovie(currentMovie);

        // Extract search keyword from movie title
        const keyword = currentMovie.title;

        // Trigger torrent search using the movie title
        await searchTorrentsAsync(keyword);
        
        // Get search results
        const searchResults = await getSearchTorrents();
        
        if (searchResults.success && searchResults.data) {
          // Extract torrents from the search results
          const torrents: TorrentInfo[] = [];
          Object.values(searchResults.data.result).forEach((movieData) => {
            if (movieData.torrent_dict) {
              movieData.torrent_dict.forEach((entry) => {
                if (Array.isArray(entry) && entry.length > 1) {
                  const [_, categories] = entry;
                  Object.values(categories).forEach((category) => {
                    if (category.group_torrents) {
                      Object.values(category.group_torrents).forEach((group) => {
                        if (group.torrent_list) {
                          torrents.push(...group.torrent_list);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
          setResources(torrents);
        } else {
          setError('No torrents found for this movie');
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


  const handleDownload = async (resource: TorrentInfo) => {
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="calc(100vh - 8rem)"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={30} />
            <Typography variant="h6" color="text.secondary">
              Loading resources...
            </Typography>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  if (error || !movie) {
    return (
      <MainLayout>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="calc(100vh - 8rem)"
        >
          <Box textAlign="center">
            <Typography variant="body1" color="error" mb={2}>
              {error || 'Movie not found'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Resources for "${movie.title}"`}>
      <Container maxWidth="md">
        {/* Movie Header */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Card>
            <CardMedia
              component="img"
              image={movie.image}
              alt={movie.title}
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                height: 120,
                borderRadius: '0 0 8px 8px',
              }}
            />
            <CardContent
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                color: 'white',
              }}
            >
              <Typography variant="h5" component="h1" fontWeight="bold" mb={0.5}>
                {movie.title}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} fontSize="0.875rem">
                <Typography variant="body2" color="text.secondary">
                  {movie.year}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {movie.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography component="span" role="img" aria-label="star">
                    ⭐
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {movie.vote}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Resources List */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h2" mb={2}>
            Available Resources
          </Typography>

          {resources.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No resources available for this movie
              </Typography>
            </Box>
          ) : (
            <List>
              {resources.map((resource) => (
                <ListItem
                  key={resource.id}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 2,
                    boxShadow: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    p: 2,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="span">
                        {resource.torrent_name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {resource.description}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mt={1}
                          flexWrap="wrap"
                        >
                          <Chip label={resource.respix} size="small" />
                          <Chip label={resource.video_encode} size="small" />
                          <Chip label={resource.size} size="small" />
                          <Chip label={`${resource.seeders} seeders`} size="small" />
                          <Chip label={resource.site} size="small" />
                        </Stack>
                      </Box>
                    }
                    sx={{ flexGrow: 1, mb: { xs: 1, sm: 0 } }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(resource)}
                    sx={{ ml: { sm: 2 } }}
                  >
                    Download
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
};

export default MediaResourcesPage;