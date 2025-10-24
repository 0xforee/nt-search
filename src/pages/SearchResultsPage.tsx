import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { SearchResponse } from '../types';
import { apiRequest } from '../services/api';
import { useSearch } from '../context/SearchContext';
import { Container, Box, Typography, Button, CircularProgress, Grid, Card, CardMedia, CardContent } from '@mui/material';

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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 8rem)">
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={32} />
            <Typography variant="body1" color="text.primary">Loading results...</Typography>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title={`Search Results for "${query}"`}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 8rem)">
          <Box textAlign="center">
            <Typography variant="body1" color="error" mb={2}>{error}</Typography>
            <Button 
              onClick={() => window.location.reload()}
              variant="contained"
              color="primary"
            >
              Try Again
            </Button>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Search Results for "${query}"`}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {searchResults.length === 0 ? (
          <Box textAlign="center" color="text.secondary">
            <Typography variant="body1">No results found for "{query}"</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {searchResults.map((result) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={result.id}>
                <Card 
                  onClick={() => handleMovieClick(result.id, result.media_type)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' },
                    backgroundColor: 'background.paper',
                    boxShadow: 3
                  }}
                >
                  <CardMedia
                    component="img"
                    image={result.poster || '/placeholder-movie.svg'}
                    alt={result.title}
                    sx={{
                      width: '100%',
                      aspectRatio: '2/3',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-movie.svg';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 1, backgroundColor: 'grey.800', borderTop: '1px solid', borderColor: 'grey.700' }}>
                    <Typography variant="subtitle2" color="text.primary" noWrap>{result.title}</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">{result.year || 'N/A'}</Typography>
                      <Typography variant="caption" color="warning.main">★ {result.vote}</Typography>
                    </Box>
                    <Box mt={0.5}>
                      <Typography variant="caption" color="text.secondary">{result.category}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
};

export default SearchResultsPage;