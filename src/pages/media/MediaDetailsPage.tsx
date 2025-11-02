import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { MovieDetails, MovieDetailsResponse } from '../../types';
import { apiRequest } from '../../services/http-client';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const MediaDetailsPage: React.FC = () => {
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
        const mediaType = searchParams.get('type') || 'MOV';

        // Prepare request parameters
        const requestParams = {
          type: mediaType,
          tmdbid: id
        };

        // Use apiRequest instead of direct fetch
        const data = await apiRequest<MovieDetailsResponse>('/media/detail', {
          method: 'POST',
          urlEncoded: true,
          body: requestParams
        });
        
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 8rem)">
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" color="text.primary" ml={2}>正在加载电影详情...</Typography>
        </Box>
      </MainLayout>
    );
  }

  if (error || !movie) {
    return (
      <MainLayout>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="calc(100vh - 8rem)">
          <Typography variant="h6" color="error" mb={2}>{error || '电影未找到'}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={movie.title}>
      <Box sx={{ position: 'relative' }}>
        {/* Background Image with Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            height: '500px',
            backgroundImage: `url(${movie.background[0] || movie.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, #121212 100%)' }}></Box>
        </Box>

        {/* Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', pt: 6, pb: 8 }}>
          {/* Movie Header */}
          <Box sx={{ maxWidth: 'lg' }}>
            <Typography variant="h4" component="h1" color="white" fontWeight="bold" mb={2} sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{movie.title}</Typography>
            <Stack direction="row" spacing={3} alignItems="center" mb={3}>
              <Typography variant="h6" color="text.secondary">{movie.year}</Typography>
              <Chip
                icon={<StarIcon sx={{ color: 'yellow.400 !important' }} />}
                label={movie.vote}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'yellow.400', fontWeight: 'bold' }}
              />
              <Typography variant="h6" color="text.secondary">{movie.genres}</Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" lineHeight={1.6} mb={4} sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{movie.overview}</Typography>

            {/* Search Resources Button */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={() => navigate(`/media/${id}/resources?type=${searchParams.get('type') || 'MOV'}`, { state: { movie } })}
              sx={{ mt: 2, mb: 4, py: 2, px: 4, fontSize: '1rem' }}
            >
              搜索资源
            </Button>

            {/* Additional Info */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
              {movie.fact.map((fact, index) => (
                <Card key={index} sx={{ bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', borderRadius: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>{Object.keys(fact)[0]}</Typography>
                    <Typography variant="body1" color="white">{Object.values(fact)[0]}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>

        {/* Content Sections */}
        <Box sx={{ bgcolor: 'background.default', py: 6 }}>
          <Container maxWidth="lg">
            {/* Cast Section */}
            <Box mb={6}>
              <Typography variant="h6" component="h2" color="text.primary" fontWeight="bold" mb={3}>演员</Typography>
              <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { height: '8px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' } }}>
                {movie.actors.slice(0, 10).map((actor) => (
                  <Box key={actor.id} sx={{ flexShrink: 0, textAlign: 'center', width: 120 }}>
                    <Avatar
                      src={actor.image}
                      alt={actor.name}
                      sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5, '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.3s' }}
                    />
                    <Typography variant="subtitle2" color="text.primary" noWrap>{actor.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{actor.role}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Crew Section */}
            <Box mb={6}>
              <Typography variant="h6" component="h2" color="text.primary" fontWeight="bold" mb={3}>制作团队</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {movie.crews.map((crew, index) => (
                  <Card key={index} sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, '&:hover': { bgcolor: 'grey.800' }, transition: 'background-color 0.3s' }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="text.primary" mb={1}>{Object.keys(crew)[0]}</Typography>
                      <Typography variant="body1" color="text.secondary">{Object.values(crew)[0]}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* Background Images */}
            {movie.background.length > 0 && (
              <Box>
                <Typography variant="h6" component="h2" color="text.primary" fontWeight="bold" mb={3}>背景图片</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {movie.background.map((bg, index) => (
                    <Box key={index}>
                      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3, '&:hover': { transform: 'scale(1.03)' }, transition: 'transform 0.3s' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={bg}
                          alt={`${movie.title} background ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default MediaDetailsPage;