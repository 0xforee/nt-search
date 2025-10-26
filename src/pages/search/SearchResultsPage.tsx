import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { searchMedia } from '../../services/api';
// import { apiRequest } from '../../services/http-client';
import { RspSearchItem } from '../../services/api';
import { useSearch } from '../../context/SearchContext';
import { Container, Box, Typography, Button, CircularProgress, Card, CardMedia, CardContent } from '@mui/material';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const year = searchParams.get('year') || '';
  const season = searchParams.get('season') || '';
  const sites = searchParams.get('sites') || '';
  const quality = searchParams.get('quality') || '';
  const resolution = searchParams.get('resolution') || '';
  const promotion = searchParams.get('promotion') || '';
  const rule = searchParams.get('rule') || '';
  const { searchResults, setSearchResults } = useSearch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      setIsLoading(true);
      setError(null);

      try {
        // Build search parameters for advanced search
        const searchParams: any = {
          type: 'SEARCH',
          subtype: '',
          page: '1',
          keyword: query
        };

        // Add advanced search filters if they exist
        if (type) searchParams.advanced_type = type;
        if (year) searchParams.advanced_year = year;
        if (season) searchParams.advanced_season = season;
        if (sites) searchParams.advanced_sites = sites;
        if (quality) searchParams.advanced_quality = quality;
        if (resolution) searchParams.advanced_resolution = resolution;
        if (promotion) searchParams.advanced_promotion = promotion;
        if (rule) searchParams.advanced_rule = rule;


        const data = await searchMedia(searchParams);
        if (!data.success) {
          throw new Error(data.message || 'Search failed');
        }

        setSearchResults(data.data.Items as RspSearchItem[]);
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, type, year, season, sites, quality, resolution, promotion, rule]);

  const handleMovieClick = (id: number, media_type: string) => {
    const mediaType = media_type === '动漫' || media_type === '电视剧' ? 'TV' : 'MOV';
    navigate(`/media/${id}?type=${mediaType}`);
  };

  const searchTitle = query || 'Advanced Search';
  const hasAdvancedFilters = type || year || season || sites || quality || resolution || promotion || rule;

  if (isLoading) {
    return (
      <MainLayout title={`Search Results for "${searchTitle}"`}>
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
      <MainLayout title={`Search Results for "${searchTitle}"`}>
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
    <MainLayout title={`Search Results for "${searchTitle}"`}>
      <Container maxWidth="lg">
        {searchResults.length === 0 ? (
          <Box textAlign="center" color="text.secondary">
            <Typography variant="body1">No results found for "{searchTitle}"</Typography>
            {hasAdvancedFilters && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search filters or using different keywords.
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2 }}>
            {searchResults.map((result) => (
              <Box key={result.id}>
                <Card 
                  onClick={() => handleMovieClick(result.id, result.media_type)}
                  sx={{
                    height: '20rem',
                    width: '10rem',
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
                      height: '14rem',
                      aspectRatio: '2/3',
                      objectFit: 'fill',
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
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default SearchResultsPage;