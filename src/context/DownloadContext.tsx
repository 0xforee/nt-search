import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initiateDownload, trackDownloadProgress, cancelDownloadRequest } from '../services/downloadService';
import { Download } from '../types';

interface DownloadContextType {
  activeDownloads: Download[];
  downloadHistory: Download[];
  addDownload: (download: Omit<Download, 'id' | 'startedAt'>) => Promise<string>;
  cancelDownload: (downloadId: string) => Promise<void>;
  retryDownload: (download: Download) => Promise<void>;
  updateDownloadProgress: (downloadId: string, progress: number, speed: number) => void;
  completeDownload: (downloadId: string) => void;
  failDownload: (downloadId: string, error: string) => void;
  startDownload: (resourceId: string, movieId: string) => Promise<string>;
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

  const addDownload = useCallback(async (download: Omit<Download, 'id' | 'startedAt'>) => {
    try {
      // Create a temporary download object with pending status
      const tempId = Date.now().toString();
      const newDownload: Download = {
        ...download,
        id: tempId,
        startedAt: new Date().toISOString(),
        progress: 0,
        speed: 0,
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

  const cancelDownload = useCallback(async (downloadId: string) => {
    try {
      // First update UI to show cancellation is in progress
      setActiveDownloads(prev =>
        prev.map(download =>
          download.id === downloadId
            ? { ...download, status: 'paused' }
            : download
        )
      );
      
      // Call API to cancel the download
      await cancelDownloadRequest(downloadId);
      
      // Remove from active downloads
      setActiveDownloads(prev => prev.filter(d => d.id !== downloadId));
    } catch (error) {
      console.error('Error canceling download:', error);
      // If cancellation fails, keep the download but mark as failed
      failDownload(downloadId, 'Failed to cancel download');
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
        speed: 0
      };
      
      // Use the addDownload function to initiate the download again
      await addDownload(retryDownload);
    } catch (error) {
      console.error('Error retrying download:', error);
      // If retry fails, add back to history
      setDownloadHistory(prev => [download, ...prev]);
    }
  }, [addDownload]);

  const updateDownloadProgress = useCallback((downloadId: string, progress: number, speed: number) => {
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
  
  // Function to poll for download progress updates from the server
  const pollDownloadProgress = useCallback(async (downloadId: string) => {
    try {
      const response = await trackDownloadProgress(downloadId);
      
      if (response && response.success) {
        const { progress, speed, status } = response.data;
        
        if (status === 'completed') {
          completeDownload(downloadId);
        } else if (status === 'failed') {
          failDownload(downloadId, response.data.error || 'Download failed');
        } else {
          updateDownloadProgress(downloadId, progress, speed);
        }
        
        return status;
      }
    } catch (error) {
      console.error(`Error polling download progress for ${downloadId}:`, error);
    }
    
    return null;
  }, []);
  
  // Set up polling for active downloads
  useEffect(() => {
    if (activeDownloads.length === 0) return;
    
    const pollingInterval = setInterval(() => {
      activeDownloads.forEach(download => {
        if (download.status === 'downloading') {
          pollDownloadProgress(download.id);
        }
      });
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(pollingInterval);
  }, [activeDownloads, pollDownloadProgress]);

  const completeDownload = useCallback((downloadId: string) => {
    setActiveDownloads(prev => {
      const completedDownload = prev.find(d => d.id === downloadId);
      if (completedDownload) {
        const updatedDownload: Download = {
          ...completedDownload,
          status: 'completed',
          progress: 100,
          speed: 0,
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
        speed: 0
      };
      
      const downloadId = await addDownload(downloadData);
      return downloadId;
    } catch (error) {
      console.error('Error starting download:', error);
      throw error;
    }
  }, [addDownload]);

  return (
    <DownloadContext.Provider
      value={{
        activeDownloads,
        downloadHistory,
        addDownload,
        cancelDownload,
        retryDownload,
        updateDownloadProgress,
        completeDownload,
        failDownload,
        startDownload
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};