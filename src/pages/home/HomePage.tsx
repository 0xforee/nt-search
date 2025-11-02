import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { searchMedia } from '../../services/api';
import { RspSearchItem } from '../../services/api';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';

interface HomePageProps {
  currentTab?: number;
  onTabChange?: (tab: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ currentTab = 0, onTabChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching] = useState(false);
  const [movieItems, setMovieItems] = useState<RspSearchItem[]>([]);
  const [tvItems, setTvItems] = useState<RspSearchItem[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [isLoadingTv, setIsLoadingTv] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  useEffect(() => {
    if (currentTab === 1 && movieItems.length === 0) {
      // Load movies when switching to Movies tab
      fetchMovies();
    } else if (currentTab === 2 && tvItems.length === 0) {
      // Load TV shows when switching to TV tab
      fetchTVShows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const fetchMovies = async () => {
    setIsLoadingMovies(true);
    try {
      const data = await searchMedia({
        type: 'RECOMMEND',
        subtype: '',
        page: '1',
        keyword: ''
      });
      
      if (data.success && data.data.Items) {
        // Filter movies only (exclude TV shows and anime)
        const movies = data.data.Items.filter(
          item => item.media_type !== '电视剧' && item.media_type !== '动漫'
        );
        setMovieItems(movies);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const fetchTVShows = async () => {
    setIsLoadingTv(true);
    try {
      const data = await searchMedia({
        type: 'RECOMMEND',
        subtype: '',
        page: '1',
        keyword: ''
      });
      
      if (data.success && data.data.Items) {
        // Filter TV shows and anime only
        const tvShows = data.data.Items.filter(
          item => item.media_type === '电视剧' || item.media_type === '动漫'
        );
        setTvItems(tvShows);
      }
    } catch (err) {
      console.error('Failed to fetch TV shows:', err);
    } finally {
      setIsLoadingTv(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleMovieClick = (id: number, media_type: string) => {
    const mediaType = media_type === '动漫' || media_type === '电视剧' ? 'TV' : 'MOV';
    navigate(`/media/${id}?type=${mediaType}`);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentTab < 2) {
      // Swipe left: go to next tab
      onTabChange?.(currentTab + 1);
    } else if (isRightSwipe && currentTab > 0) {
      // Swipe right: go to previous tab
      onTabChange?.(currentTab - 1);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="lg"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{ touchAction: 'pan-y pan-x' }}
    >
      {/* Home Tab Content */}
      {currentTab === 0 && (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'calc(100vh - 128px)', // Adjust based on header/footer height
          textAlign: 'center',
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            欢迎，{user?.username}！
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            搜索您喜爱的电影和电视剧
          </Typography>
          
          {/* Temporarily hidden */}
          {/* <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/advanced-search')}
              sx={{ mr: 2 }}
            >
              高级搜索
            </Button>
          </Box> */}
          
          <Box component="form" onSubmit={handleSearch} sx={{ width: '100%', maxWidth: 600, mt: 3, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="搜索电影或电视剧..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSearching || !searchQuery.trim()}
              sx={{
                borderRadius: '50px',
                minWidth: '100px',
              }}
            >
              {isSearching ? <CircularProgress size={24} color="inherit" /> : '搜索'}
            </Button>
          </Box>
        </Box>
        
        {/* Version at bottom */}
        <Box sx={{ py: 2 }}>
          <Typography variant="caption" color="text.secondary">
            v{import.meta.env.VITE_APP_VERSION}
          </Typography>
        </Box>
      </Box>
      )}

      {/* Movies Tab Content */}
      {currentTab === 1 && (
        <Box>
          {isLoadingMovies ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={32} />
                <Typography variant="body1" color="text.primary">正在加载电影...</Typography>
              </Box>
            </Box>
          ) : movieItems.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                暂无电影推荐
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2 }}>
              {movieItems.map((item) => (
                <Box key={item.id}>
                  <Card 
                    onClick={() => handleMovieClick(item.id, item.media_type)}
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
                      image={item.poster || '/placeholder-movie.svg'}
                      alt={item.title}
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
                      <Typography variant="subtitle2" color="text.primary" noWrap>{item.title}</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Typography variant="caption" color="text.secondary">{item.year || 'N/A'}</Typography>
                        <Typography variant="caption" color="warning.main">★ {item.vote}</Typography>
                      </Box>
                      <Box mt={0.5}>
                        <Typography variant="caption" color="text.secondary">{item.category}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* TV Shows Tab Content */}
      {currentTab === 2 && (
        <Box>
          {isLoadingTv ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={32} />
                <Typography variant="body1" color="text.primary">正在加载电视剧...</Typography>
              </Box>
            </Box>
          ) : tvItems.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                暂无电视剧推荐
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2 }}>
              {tvItems.map((item) => (
                <Box key={item.id}>
                  <Card 
                    onClick={() => handleMovieClick(item.id, item.media_type)}
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
                      image={item.poster || '/placeholder-movie.svg'}
                      alt={item.title}
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
                      <Typography variant="subtitle2" color="text.primary" noWrap>{item.title}</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Typography variant="caption" color="text.secondary">{item.year || 'N/A'}</Typography>
                        <Typography variant="caption" color="warning.main">★ {item.vote}</Typography>
                      </Box>
                      <Box mt={0.5}>
                        <Typography variant="caption" color="text.secondary">{item.category}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default HomePage;