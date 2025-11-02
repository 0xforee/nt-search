import React, { useEffect, useState } from 'react';
import { useDownload } from '../context/DownloadContext';
import { Container, Box, Typography, LinearProgress, List, ListItem, ListItemText, ListItemIcon, IconButton, Pagination, Tabs, Tab } from '@mui/material';
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
    startPausedDownload,
    pauseActiveDownload
  } = useDownload();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [completedPage, setCompletedPage] = useState(1);
  const itemsPerPage = 10;

  // Combine local history and API history for completed downloads
  const allCompletedDownloads = [...downloadHistory, ...apiDownloadHistory];
  
  // Calculate pagination for completed downloads
  const totalCompletedPages = Math.ceil(allCompletedDownloads.length / itemsPerPage);
  const paginatedCompletedDownloads = allCompletedDownloads.slice(
    (completedPage - 1) * itemsPerPage,
    completedPage * itemsPerPage
  );

  useEffect(() => {
    fetchActiveDownloads();
    fetchDownloadHistory(1);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    // Reset to first page when switching tabs
    if (newValue === 1) {
      setCompletedPage(1);
    }
  };

  const handleCompletedPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCompletedPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            borderRadius: 2,
            px: 2,
            boxShadow: 2,
            '& .MuiTab-root': {
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 48,
              py: 1.5,
              px: 3,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 700,
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab label={`正在下载 (${activeDownloads.length})`} />
          <Tab label={`完成下载 (${allCompletedDownloads.length})`} />
        </Tabs>
      </Box>

      {/* Active Downloads Tab */}
      {currentTab === 0 && (
        <Box>
          <List>
            {activeDownloads.length === 0 ? (
              <Box textAlign="center" color="text.secondary" py={4}>
                <Typography variant="body1">暂无正在下载的任务</Typography>
              </Box>
            ) : (
              activeDownloads.map(download => {
                const title = (download as any).title || 'Movie Title';
                const image = (download as any).image || '';
                const state = (download as any).state || download.status;
                const speedText = typeof download.speed === 'string' ? download.speed : `${download.speed} MB/s`;
                
                // Translate state to Chinese
                const getStateText = (stateValue: string) => {
                  const stateLower = stateValue.toLowerCase();
                  if (stateLower === 'paused' || stateLower === 'stoped' || stateLower === 'stopped') {
                    return '已暂停';
                  } else if (stateLower === 'downloading') {
                    return '下载中';
                  } else if (stateLower === 'pending') {
                    return '等待中';
                  } else if (stateLower === 'completed') {
                    return '已完成';
                  } else if (stateLower === 'failed') {
                    return '失败';
                  }
                  return stateValue;
                };
                
                const stateText = getStateText(state);
                
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
                          <Typography variant="body2" color="text.secondary" component="span">{download.progress}% - {stateText} - {speedText}</Typography>
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
                          title="开始下载"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      ) : (
                        <IconButton 
                          onClick={() => pauseActiveDownload(download.id)}
                          color="warning"
                          title="暂停下载"
                        >
                          <PauseIcon />
                        </IconButton>
                      )}
                      <IconButton 
                        onClick={() => removeDownload(download.id)}
                        color="error"
                        title="移除下载"
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
      )}

      {/* Completed Downloads Tab */}
      {currentTab === 1 && (
        <Box>
          <List>
            {allCompletedDownloads.length === 0 ? (
              <Box textAlign="center" color="text.secondary" py={4}>
                <Typography variant="body1">暂无完成的下载</Typography>
              </Box>
            ) : (
              paginatedCompletedDownloads.map((item: any) => {
                const title = item.title || 'Movie Title';
                const image = item.image || '';
                const name = item.name || '';
                const status = item.status || 'completed';
                const date = item.date || '';
                const mediaType = item.media_type || '';
                const year = item.year || '';
                const site = item.site || '';
                const overview = item.overview || '';
                
                return (
                  <ListItem key={item.id} sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 2, boxShadow: 1 }}>
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
                          {status === 'completed' ? (
                            <>
                              {mediaType && (
                                <Typography variant="body2" color="text.secondary" component="span">
                                  {mediaType} • {year} • {site}
                                </Typography>
                              )}
                              {overview && (
                                <Typography variant="body2" color="text.secondary" mt={0.5} component="span" display="block">
                                  {overview}
                                </Typography>
                              )}
                              {date && (
                                <Typography variant="caption" color="text.secondary" mt={0.5} component="span" display="block">
                                  下载于 {date}
                                </Typography>
                              )}
                              {name && !date && (
                                <Typography variant="body2" color="text.secondary" component="span">
                                  {name}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary" component="span">
                              失败 • {name}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <Box>
                      {status === 'failed' && (
                        <IconButton 
                          onClick={() => retryDownload(item)}
                          color="primary"
                        >
                          <ReplayIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                );
              })
            )}
          </List>
          
          {/* Pagination for completed downloads */}
          {totalCompletedPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalCompletedPages}
                page={completedPage}
                onChange={handleCompletedPageChange}
                color="primary"
                sx={{'& .MuiPaginationItem-root': { color: 'text.primary' }}}
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default DownloadsPage;