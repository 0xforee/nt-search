import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDownload } from '../../context/DownloadContext';
import { useSearch } from '../../context/SearchContext';
import MainLayout from '../../layouts/MainLayout';
import { searchTorrentsAsync, getSearchTorrents, TorrentInfo } from '../../services/api';
import { MovieData } from '../../types';
import { processMovieResources, ProcessedMovieResources, GroupedResources, findRecommendedResource } from '../../utils/movieUtils';
import { processTVResources } from '../../utils/tvUtils';
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
  Tabs,
  Tab,
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
  const [processedResources, setProcessedResources] = useState<ProcessedMovieResources | null>(null);
  const [selectedTab, setSelectedTab] = useState<keyof GroupedResources>('4k');
  const [recommendedResource, setRecommendedResource] = useState<TorrentInfo | null>(null);
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
          // Find recommended resource
          const recommended = findRecommendedResource(searchResults);
          setRecommendedResource(recommended);
          
          // Determine if it's a movie or TV show by checking type_key from search results
          // Get the first result to check type_key (MovieTorrentResource)
          const firstResult = Object.values(searchResults.data.result)[0];
          const isMovie = firstResult?.type_key === 'MOV' || firstResult?.type === '电影';
          
          if (isMovie) {
            // Process movie resources
            const processed = processMovieResources(searchResults);
            setProcessedResources(processed);
            
            // Set initial resources based on seeders availability
            if (processed.hasResources) {
              // Get resources from the first available tab
              const tabs: (keyof GroupedResources)[] = ['4k', '2k', '1080p', 'other'];
              let initialTab = tabs.find(tab => processed.groupedResources[tab].length > 0);
              
              if (initialTab) {
                setSelectedTab(initialTab);
                setResources(processed.groupedResources[initialTab]);
              } else {
                // This shouldn't happen if hasResources is true, but handle it
                setResources([]);
              }
            } else {
              // No resources found
              setResources([]);
            }
          } else {
            // Process TV resources (temporarily return original)
            const tvResources = processTVResources(searchResults);
            setResources(tvResources);
          }
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

          {/* Recommended Resource */}
          {recommendedResource && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" mb={1.5}>
                ⭐ 推荐资源
              </Typography>
              <Card
                sx={{
                  bgcolor: 'primary.light',
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    p: 2.5,
                  }}
                >
                  <Box sx={{ flexGrow: 1, mb: { xs: 2, sm: 0 }, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: { sm: '60ch' },
                      }}
                    >
                      {recommendedResource.torrent_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="div"
                      sx={{ mt: 0.5, mb: 1.5 }}
                    >
                      {recommendedResource.description}
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      flexWrap="wrap"
                    >
                      <Chip
                        label={recommendedResource.video_encode}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Chip
                        label={recommendedResource.size}
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Chip
                        label={`${recommendedResource.seeders} seeders`}
                        size="small"
                        color={recommendedResource.seeders > 0 ? 'success' : 'default'}
                        sx={{ fontWeight: 'bold' }}
                      />
                      {recommendedResource.releasegroup && (
                        <Chip
                          label={recommendedResource.releasegroup}
                          size="small"
                          color="info"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                      <Chip
                        label={recommendedResource.site}
                        size="small"
                        color="info"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Stack>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(recommendedResource)}
                    sx={{
                      ml: { sm: 2 },
                      minWidth: '120px',
                      flexShrink: 0,
                      fontWeight: 'bold',
                    }}
                  >
                    Download
                  </Button>
                </Box>
              </Card>
            </Box>
          )}

          {/* Movie: Show tabs for grouped resources */}
          {processedResources ? (
            <>
              {!processedResources.hasResources ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    未发现资源
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Resolution Tabs - only show tabs with resources */}
                  {(() => {
                    const tabsWithResources = (['4k', '2k', '1080p', 'other'] as const).filter(
                      (tab) => processedResources.groupedResources[tab].length > 0
                    );

                    // If no tabs have resources, this shouldn't happen (should show "未发现资源")
                    if (tabsWithResources.length === 0) {
                      return null;
                    }

                    return (
                      <Tabs
                        value={selectedTab}
                        onChange={(_, newValue: keyof GroupedResources) => {
                          setSelectedTab(newValue);
                          setResources(processedResources.groupedResources[newValue]);
                        }}
                        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                      >
                        {tabsWithResources.map((tab) => {
                          const count = processedResources.groupedResources[tab].length;
                          return (
                            <Tab
                              key={tab}
                              label={`${tab.toUpperCase()} (${count})`}
                              value={tab}
                            />
                          );
                        })}
                      </Tabs>
                    );
                  })()}

                  {/* Resources for selected tab */}
                  {resources.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No resources in {selectedTab.toUpperCase()} category
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
                          <Box sx={{ flexGrow: 1, mb: { xs: 1, sm: 0 }, minWidth: 0 }}>
                            <Typography 
                              variant="subtitle1" 
                              component="div" 
                              gutterBottom
                              sx={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                maxWidth: { sm: '60ch' },
                              }}
                            >
                              {resource.torrent_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5, mb: 1 }}>
                              {resource.description}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              flexWrap="wrap"
                            >
                              <Chip label={resource.video_encode} size="small" color="primary" />
                              <Chip label={resource.size} size="small" color="secondary" />
                              <Chip
                                label={`${resource.seeders} seeders`}
                                size="small"
                                color={resource.seeders > 0 ? 'success' : 'default'}
                              />
                              <Chip label={resource.site} size="small" color="info" />
                            </Stack>
                          </Box>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(resource)}
                            sx={{ 
                              ml: { sm: 2 },
                              minWidth: '120px',
                              flexShrink: 0,
                            }}
                          >
                            Download
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </>
              )}
            </>
          ) : (
            /* TV or fallback: Show simple list */
            resources.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No resources available
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
                    <Box sx={{ flexGrow: 1, mb: { xs: 1, sm: 0 }, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle1" 
                        component="div" 
                        gutterBottom
                        sx={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: { sm: '60ch' },
                        }}
                      >
                        {resource.torrent_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5, mb: 1 }}>
                        {resource.description}
                      </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          flexWrap="wrap"
                        >
                          <Chip label={resource.video_encode} size="small" color="primary" />
                          <Chip label={resource.size} size="small" color="secondary" />
                          <Chip label={`${resource.seeders} seeders`} size="small" />
                          <Chip label={resource.site} size="small" color="info" />
                        </Stack>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(resource)}
                      sx={{ 
                        ml: { sm: 2 },
                        minWidth: '120px',
                        flexShrink: 0,
                      }}
                    >
                      Download
                    </Button>
                  </ListItem>
                ))}
              </List>
            )
          )}
        </Box>
      </Container>
    </MainLayout>
  );
};

export default MediaResourcesPage;