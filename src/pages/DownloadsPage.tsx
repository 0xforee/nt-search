import React, { useEffect } from 'react';
import { useDownload } from '../context/DownloadContext';
import { Container, Box, Typography, LinearProgress, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
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

  // Combine local history and API history for completed downloads
  // Only show the most recent 10 items
  const allCompletedDownloads = [...downloadHistory, ...apiDownloadHistory].slice(0, 10);

  // Fetch data every time the component mounts
  useEffect(() => {
    fetchActiveDownloads();
    fetchDownloadHistory(1);
  }, [fetchActiveDownloads, fetchDownloadHistory]);

  // Translate state to Chinese helper function
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Active Downloads Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          正在下载 {activeDownloads.length > 0 && `(${activeDownloads.length})`}
        </Typography>
        <List>
          {activeDownloads.length === 0 ? (
            <Box textAlign="center" color="text.secondary" py={4}>
              <Typography variant="body1">暂无正在下载的任务</Typography>
            </Box>
          ) : (
            activeDownloads.map(download => {
              const title = (download as any).title || '电影标题';
              const image = (download as any).image || '';
              const state = (download as any).state || download.status;
              const speedText = typeof download.speed === 'string' ? download.speed : `${download.speed} MB/s`;
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

      {/* Download History Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          下载历史
          {allCompletedDownloads.length > 0 && (
            <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
              （最近10条）
            </Typography>
          )}
        </Typography>
        <List>
          {allCompletedDownloads.length === 0 ? (
            <Box textAlign="center" color="text.secondary" py={4}>
              <Typography variant="body1">暂无完成的下载</Typography>
            </Box>
          ) : (
            allCompletedDownloads.map((item: any) => {
              const title = item.title || '电影标题';
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
      </Box>
    </Container>
  );
};

export default DownloadsPage;