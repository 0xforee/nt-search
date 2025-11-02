import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <Container component="main" maxWidth="md">
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
          
          <Box component="form" onSubmit={handleSearch} sx={{ width: '100%', maxWidth: 600, mt: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="搜索电影或电视剧..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                borderRadius: '50px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                  paddingRight: '100px', // Make space for the button
                },
              }}
            >
              <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSearching || !searchQuery.trim()}
              sx={{
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                borderRadius: '50px',
                height: '16px',
                minWidth: '100px',
              }}
            >
              {isSearching ? <CircularProgress size={24} color="inherit" /> : '搜索'}
            </Button>
              </TextField>
            
          </Box>
        </Box>
        
        {/* Version at bottom */}
        <Box sx={{ py: 2 }}>
          <Typography variant="caption" color="text.secondary">
            版本 {import.meta.env.VITE_APP_VERSION}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;