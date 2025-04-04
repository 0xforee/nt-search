import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initiateDownload, getActiveDownloads, getDownloadHistory, removeDownload as removeDownloadService, startDownload as startDownloadService, stopDownload as stopDownloadService, getDownloadInfo as getDownloadInfoService } from '../services/downloadService';
import { Download } from '../types';

interface DownloadContextType {
  activeDownloads: Download[];
  downloadHistory: Download[];
  apiDownloadHistory: any[];
  addDownload: (download: Omit<Download, 'id' | 'startedAt'>) => Promise<string>;
  retryDownload: (download: Download) => Promise<void>;
  removeDownload: (downloadId: string) => Promise<void>;
  updateDownloadProgress: (downloadId: string, progress: number, speed: string) => void;
  completeDownload: (downloadId: string) => void;
  failDownload: (downloadId: string, error: string) => void;
  startDownload: (resourceId: string, movieId: string) => Promise<string>;
  startPausedDownload: (downloadId: string) => Promise<void>;
  pauseActiveDownload: (downloadId: string) => Promise<void>;
  fetchActiveDownloads: () => Promise<void>;
  fetchDownloadHistory: (page?: number) => Promise<void>;
  getDownloadInfo: (downloadId: string) => Promise<any>;
  currentHistoryPage: number;
  totalHistoryPages: number;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDownloads, setActiveDownloads] = useState<Download[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<Download[]>([]);
  const [apiDownloadHistory, setApiDownloadHistory] = useState<any[]>([]);
  const [currentHistoryPage, setCurrentHistoryPage] = useState<number>(1);
  const [totalHistoryPages, setTotalHistoryPages] = useState<number>(1);

  const addDownload = useCallback(async (download: Omit<Download, 'id' | 'startedAt'>) => {
    try {
      // Create a temporary download object with pending status
      const tempId = Date.now().toString();
      const newDownload: Download = {
        ...download,
        id: tempId,
        startedAt: new Date().toISOString(),
        progress: 0,
        speed: '',
        status: 'pending'
      };
      
      // Add to active downloads immediately to show in UI
      setActiveDownloads(prev => [...prev, newDownload]);
      
      // Make API call to initiate the download
      const response = await initiateDownload(download.resourceId);
      
      if (response.success) {
        // Update the download with the real ID from the server if provided
        const downloadId = response.data.downloadId || tempId;
        
        setActiveDownloads(prev => 
          prev.map(d => 
            d.id === tempId 
              ? { 
                  ...d, 
                  id: downloadId,
                  status: 'downloading',
                  filePath: response.data.filePath
                }
              : d
          )
        );
        
        return downloadId;
      } else {
        // If API call failed, update the download status to failed
        failDownload(tempId, response.message || 'Failed to initiate download');
        throw new Error(response.message || 'Failed to initiate download');
      }
    } catch (error) {
      console.error('Error initiating download:', error);
      throw error;
    }
  }, []);

  const retryDownload = useCallback(async (download: Download) => {
    try {
      // Remove the failed download from history
      setDownloadHistory(prev => prev.filter(d => d.id !== download.id));
      
      // Create a new download with the same resource ID
      const retryDownload: Omit<Download, 'id' | 'startedAt'> = {
        resourceId: download.resourceId,
        movieId: download.movieId,
        status: 'pending',
        progress: 0,
        speed: ''
      };
      
      // Use the addDownload function to initiate the download again
      await addDownload(retryDownload);
    } catch (error) {
      console.error('Error retrying download:', error);
      // If retry fails, add back to history
      setDownloadHistory(prev => [download, ...prev]);
    }
  }, [addDownload]);

  const updateDownloadProgress = useCallback((downloadId: string, progress: number, speed: string) => {
    setActiveDownloads(prev =>
      prev.map(download =>
        download.id === downloadId
          ? { 
              ...download, 
              progress, 
              speed,
              status: progress < 100 ? 'downloading' : 'completed'
            }
          : download
      )
    );
    
    // If download is complete, move it to history
    if (progress >= 100) {
      completeDownload(downloadId);
    }
  }, []);
  
  // Function to fetch all active downloads from the server
  const fetchActiveDownloads = useCallback(async () => {
    try {
      const response = await getActiveDownloads();
      
      if (response && response.success && response.data && response.data.result) {
        // Map the server response to our Download type
        const serverDownloads = response.data.result.map((item: any) => {
          // Parse progress to number if it's a string
          let progress = typeof item.progress === 'number' ? item.progress : 0;
          if (typeof item.progress === 'string') {
            const progressNum = parseFloat(item.progress);
            if (!isNaN(progressNum)) {
              progress = progressNum;
            }
          }
          
          // Map API response to our Download type
          return {
            id: item.id,
            resourceId: item.id, // Using id as resourceId if not provided
            movieId: item.id, // Using id as movieId if not provided
            status: item.state === 'Stoped' ? 'paused' : 'downloading',
            progress: progress,
            speed: item.speed || 0,
            startedAt: new Date().toISOString(),
            // Additional fields from API response
            name: item.name,
            title: item.title,
            image: item.image,
            state: item.state,
            site_url: item.site_url
          } as Download & { name: string; title: string; image: string; state: string; site_url: string };
        });
        
        // Update the active downloads state
        setActiveDownloads(serverDownloads);
      }
    } catch (error) {
      console.error('Error fetching active downloads:', error);
    }
  }, []);

  const refreshDownloadInfo = useCallback(async () => {
    try {
      // Create a batch request with all download IDs separated by '|'
      const downloadIds = activeDownloads.map(download => download.id).join('|');

      // Make a single API call for all active downloads
      const response = await getDownloadInfoService(downloadIds);

      if (response && response.success && response.data) {
        // Handle batch response - could be a single object or an array depending on API
        const downloadInfos = Array.isArray(response.data.torrents)? response.data.torrents : [response.data.torrents];

        // Update each download with its info
        downloadInfos.forEach(info => {
          const { id, progress, speed} = info;
          updateDownloadProgress(id, progress, speed);
        })
      }
    } catch (error) {
      console.error('Error refreshing download info:', error);
    }
  }, [])

  // Set up polling for active downloads
  useEffect(() => {
    if (activeDownloads.length === 0) return;
    
    const pollingInterval = setInterval(() => {
      // Get all activeDownloads tasks
      if (activeDownloads.length > 0) {
        refreshDownloadInfo();
      }
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(pollingInterval);
  }, [activeDownloads, updateDownloadProgress]);
  
  // Function to fetch download history from the API
  const fetchDownloadHistory = useCallback(async (page: number = 1) => {
    try {
      const response = await getDownloadHistory(page);
      
      if (response && response.success && response.data && response.data.Items) {
        setApiDownloadHistory(response.data.Items);
        setCurrentHistoryPage(page);
        // In a real API, there would likely be pagination info
        // For now, we'll just assume there's only one page if we have results
        setTotalHistoryPages(response.data.Items.length > 0 ? 2 : 1);
      }
    } catch (error) {
      console.error('Error fetching download history:', error);
    }
  }, []);
  
  // Function to get detailed information about a specific download task
  const getDownloadInfo = useCallback(async (downloadId: string) => {
    try {
      // Call the service function
      const response = await getDownloadInfoService(downloadId);
      
      if (response && response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching download info for ${downloadId}:`, error);
      return null;
    }
  }, []);

  // Fetch active downloads and history when component mounts
  useEffect(() => {
    fetchActiveDownloads();
    fetchDownloadHistory();
    
    // Removed automatic polling of 'download/now' endpoint
    // Downloads will update only when user-initiated actions occur
  }, [fetchActiveDownloads, fetchDownloadHistory]);

  const completeDownload = useCallback((downloadId: string) => {
    setActiveDownloads(prev => {
      const completedDownload = prev.find(d => d.id === downloadId);
      if (completedDownload) {
        const updatedDownload: Download = {
          ...completedDownload,
          status: 'completed',
          progress: 100,
          speed: '',
          completedAt: new Date().toISOString()
        };
        setDownloadHistory(history => [updatedDownload, ...history]);
        return prev.filter(d => d.id !== downloadId);
      }
      return prev;
    });
  }, []);

  const failDownload = useCallback((downloadId: string, error: string) => {
    setActiveDownloads(prev => {
      const failedDownload = prev.find(d => d.id === downloadId);
      if (failedDownload) {
        const updatedDownload: Download = {
          ...failedDownload,
          status: 'failed',
          error,
          completedAt: new Date().toISOString()
        };
        setDownloadHistory(history => [updatedDownload, ...history]);
        return prev.filter(d => d.id !== downloadId);
      }
      return prev;
    });
  }, []);
  
  // Function to start a download from a resource ID
  const startDownload = useCallback(async (resourceId: string, movieId: string) => {
    try {
      const downloadData: Omit<Download, 'id' | 'startedAt'> = {
        resourceId,
        movieId,
        status: 'pending',
        progress: 0,
        speed: ''
      };
      
      const downloadId = await addDownload(downloadData);
      return downloadId;
    } catch (error) {
      console.error('Error starting download:', error);
      throw error;
    }
  }, [addDownload]);

  // Function to remove a download (only works for active downloads)
  const removeDownload = useCallback(async (downloadId: string) => {
    try {
      // Check if the download exists in active downloads
      const isActiveDownload = activeDownloads.some(download => download.id === downloadId);
      
      if (!isActiveDownload) {
        console.warn('Cannot remove download that is not active:', downloadId);
        return;
      }
      
      // Call API to remove the download
      const response = await removeDownloadService(downloadId);
      
      if (response && response.success) {
        // Remove from active downloads
        setActiveDownloads(prev => prev.filter(item => item.id !== downloadId));
        
        // Refresh the active downloads to ensure UI is up to date
        fetchActiveDownloads();
      }
    } catch (error) {
      console.error('Error removing download:', error);
    }
  }, [activeDownloads, fetchActiveDownloads]);

  // Function to start a paused download
  const startPausedDownload = useCallback(async (downloadId: string) => {
    try {
      // Check if the download exists in active downloads
      const download = activeDownloads.find(download => download.id === downloadId);
      
      if (!download) {
        console.warn('Cannot start download that is not active:', downloadId);
        return;
      }
      
      // Update UI immediately to show starting status
      setActiveDownloads(prev =>
        prev.map(item =>
          item.id === downloadId
            ? { ...item, status: 'downloading', state: 'Downloading', speed: '' }
            : item
        )
      );
      
      // Call API to start the download
      const response = await startDownloadService(downloadId);
      
      if (response && response.success) {
        // Refresh the active downloads to ensure UI is up to date
        // refreshDownloadInfo();
      } else {
        // If API call failed, revert the status
        setActiveDownloads(prev =>
          prev.map(item =>
            item.id === downloadId
              ? { ...item, status: 'paused', state: 'Stoped', speed: '' }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error starting download:', error);
      // Revert UI state on error
      setActiveDownloads(prev =>
        prev.map(item =>
          item.id === downloadId
            ? { ...item, status: 'paused', state: 'Stoped', speed: '' }
            : item
        )
      );
    }
  }, [activeDownloads, fetchActiveDownloads]);

  // Function to pause an active download
  const pauseActiveDownload = useCallback(async (downloadId: string) => {
    try {
      // Check if the download exists in active downloads
      const download = activeDownloads.find(download => download.id === downloadId);
      
      if (!download) {
        console.warn('Cannot pause download that is not active:', downloadId);
        return;
      }
      
      // Update UI immediately to show pausing status
      setActiveDownloads(prev =>
        prev.map(item =>
          item.id === downloadId
            ? { ...item, status: 'paused', state: 'Stoped', speed: '' }
            : item
        )
      );
      
      // Call API to pause the download
      const response = await stopDownloadService(downloadId);
      
      if (response && response.success) {
        // Refresh the active downloads to ensure UI is up to date
        // refreshDownloadInfo();
      } else {
        // If API call failed, revert the status
        setActiveDownloads(prev =>
          prev.map(item =>
            item.id === downloadId
              ? { ...item, status: 'downloading', state: 'Downloading', speed: '' }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error pausing download:', error);
      // Revert UI state on error
      setActiveDownloads(prev =>
        prev.map(item =>
          item.id === downloadId
            ? { ...item, status: 'downloading', state: 'Downloading', speed: '' }
            : item
        )
      );
    }
  }, [activeDownloads, fetchActiveDownloads]);

  return (
    <DownloadContext.Provider
      value={{
        activeDownloads,
        downloadHistory,
        apiDownloadHistory,
        addDownload,
        retryDownload,
        removeDownload,
        updateDownloadProgress,
        completeDownload,
        failDownload,
        startDownload,
        startPausedDownload,
        pauseActiveDownload,
        fetchActiveDownloads,
        fetchDownloadHistory,
        getDownloadInfo,
        currentHistoryPage,
        totalHistoryPages
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};