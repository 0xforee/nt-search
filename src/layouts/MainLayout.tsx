import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDownload } from '../context/DownloadContext';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem, Fab, Badge, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  homeTab?: number;
  onHomeTabChange?: (tab: number) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title, homeTab, onHomeTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeDownloads } = useDownload();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isHomePage = location.pathname === '/';
  const isDownloadPage = location.pathname === '/downloads';
  const showNavBar = !isHomePage;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar disableGutters sx={{ px: 2, position: 'relative' }}>
          {showNavBar && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="back"
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          
          {isHomePage ? (
            <>
              {/* Logo/Title */}
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
                NT Search
              </Typography>
              
              {/* Tabs - Centered */}
              <Box sx={{ 
                position: 'absolute', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: 'fit-content'
              }}>
                <Tabs 
                  value={homeTab ?? 0} 
                  onChange={(_, newValue) => onHomeTabChange?.(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      minHeight: 48,
                      px: 2,
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                    },
                  }}
                >
                  <Tab label="首页" />
                  <Tab label="电影" />
                  <Tab label="电视剧" />
                </Tabs>
              </Box>
            </>
          ) : (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title || ''}
            </Typography>
          )}
          
          {/* User Menu - Always visible on home page */}
          {isHomePage && (
            <Box sx={{ ml: 'auto' }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ ml: 2 }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
          pb: 4,
          position: 'relative'
        }}
      >
        {children}
      </Box>

      {!isDownloadPage && (
        <Fab
          color="primary"
          aria-label="downloads"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          onClick={() => navigate('/downloads')}
        >
          <Badge badgeContent={activeDownloads.length} color="error">
            <DownloadIcon />
          </Badge>
        </Fab>
      )}
    </Box>
  );
};

export default MainLayout;