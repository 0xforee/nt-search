import React, { useEffect, useState } from 'react';
import { useDownload } from '../context/DownloadContext';
import { Container, Box, Typography, Button, LinearProgress, List, ListItem, ListItemText, ListItemIcon, IconButton, Pagination } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';

const DownloadsPage: React.FC = () => {
  const { 
    activeDownloads, 
    downloadHistory, 
    apiDownloadHistory,
    retryDownload,
    removeDownload,
    fetchActiveDownloads,
    fetchDownloadHistory,
    totalHistoryPages,
    startPausedDownload,
    pauseActiveDownload
  } = useDownload();
  
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    
  }, [activeDownloads])

  // Fetch active downloads and history when component mounts
  useEffect(() => {
    fetchActiveDownloads();
    fetchDownloadHistory(historyPage);
    
    // Removed automatic polling of 'download/now' endpoint
    // Downloads will update only when user-initiated actions occur
  }, []);

  return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Active Downloads */}
        <Box mb={4}>
          <Typography variant="h6" component="h2" color="text.primary" mb={2}>Active Downloads</Typography>
          <List>
            {activeDownloads.length === 0 ? (
              <Box textAlign="center" color="text.secondary" py={4}>
                <Typography variant="body1">No active downloads</Typography>
              </Box>
            ) : (
              activeDownloads.map(download => {
                const title = (download as any).title || 'Movie Title';
                const image = (download as any).image || '';
                const state = (download as any).state || download.status;
                const speedText = typeof download.speed === 'string' ? download.speed : `${download.speed} MB/s`;
                
                return (
                  <ListItem key={download.id} sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 2, boxShadow: 1 }}>
                    <ListItemIcon>
                      {image ? (
                        <img src={image} alt={title} style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <Box sx={{ width: 40, height: 60, bgcolor: 'grey.700', borderRadius: 4 }}></Box>
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle1" color="text.primary">{title}</Typography>}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" component="span">{download.progress}% - {state} - {speedText}</Typography>
                          <LinearProgress variant="determinate" value={download.progress} sx={{ mt: 0.5 }} />
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      {state === 'paused' || state === 'Stoped' ? (
                        <IconButton 
                          onClick={() => startPausedDownload(download.id)}
                          color="success"
                          title="Start Download"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      ) : (
                        <IconButton 
                          onClick={() => pauseActiveDownload(download.id)}
                          color="warning"
                          title="Pause Download"
                        >
                          <PauseIcon />
                        </IconButton>
                      )}
                      <IconButton 
                        onClick={() => removeDownload(download.id)}
                        color="error"
                        title="Remove Download"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })
            )}
          </List>
        </Box>

        {/* Local Download History */}
        {downloadHistory.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" component="h2" color="text.primary" mb={2}>Recent Downloads</Typography>
            <List>
              {downloadHistory.map(download => {
                const title = (download as any).title || 'Movie Title';
                const image = (download as any).image || '';
                const name = (download as any).name || '';
                
                return (
                  <ListItem key={download.id} sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 2, boxShadow: 1 }}>
                    <ListItemIcon>
                      {image ? (
                        <img src={image} alt={title} style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <Box sx={{ width: 40, height: 60, bgcolor: 'grey.700', borderRadius: 4 }}></Box>
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle1" color="text.primary">{title}</Typography>}
                      secondary={
                        <Typography variant="body2" color="text.secondary" component="span">
                          {download.status === 'completed' ? 'Completed' : 'Failed'} • {name}
                        </Typography>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <Box>
                      {download.status === 'failed' && (
                        <IconButton 
                          onClick={() => retryDownload(download)}
                          color="primary"
                        >
                          <ReplayIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
        
        {/* API Download History */}
        <Box>
          <Typography variant="h6" component="h2" color="text.primary" mb={2}>Download History</Typography>
          <List>
            {apiDownloadHistory.length === 0 ? (
              <Box textAlign="center" color="text.secondary" py={4}>
                <Typography variant="body1">No download history</Typography>
              </Box>
            ) : (
              apiDownloadHistory.map((item: any) => {
                return (
                  <ListItem key={item.id} sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 2, boxShadow: 1 }}>
                    <ListItemIcon>
                      {item.image ? (
                        <img src={item.image} alt={item.title} style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <Box sx={{ width: 40, height: 60, bgcolor: 'grey.700', borderRadius: 4 }}></Box>
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle1" color="text.primary">{item.title}</Typography>}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" component="span">
                            {item.media_type} • {item.year} • {item.site}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mt={0.5} noWrap component="span">
                            {item.overview}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" mt={0.5} component="span">
                            Downloaded on {item.date}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                );
              })
            )}
            
            {/* Pagination */}
            {apiDownloadHistory.length > 0 && totalHistoryPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalHistoryPages}
                  page={historyPage}
                  onChange={(event, value) => {
                    setHistoryPage(value);
                    fetchDownloadHistory(value);
                  }}
                  color="primary"
                  sx={{'& .MuiPaginationItem-root': { color: 'text.primary' }}}
                />
              </Box>
            )}
          </List>
        </Box>
      </Container>
  );
};

export default DownloadsPage;