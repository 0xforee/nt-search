import React, { createContext, useContext, useState, useCallback } from 'react';
import { Download } from '../types';

interface DownloadContextType {
  activeDownloads: Download[];
  downloadHistory: Download[];
  addDownload: (download: Omit<Download, 'id' | 'startedAt'>) => void;
  cancelDownload: (downloadId: string) => void;
  retryDownload: (download: Download) => void;
  updateDownloadProgress: (downloadId: string, progress: number, speed: number) => void;
  completeDownload: (downloadId: string) => void;
  failDownload: (downloadId: string, error: string) => void;
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

  const addDownload = useCallback((download: Omit<Download, 'id' | 'startedAt'>) => {
    const newDownload: Download = {
      ...download,
      id: Date.now().toString(),
      startedAt: new Date().toISOString(),
      progress: 0,
      speed: 0
    };
    setActiveDownloads(prev => [...prev, newDownload]);
  }, []);

  const cancelDownload = useCallback((downloadId: string) => {
    setActiveDownloads(prev => prev.filter(d => d.id !== downloadId));
  }, []);

  const retryDownload = useCallback((download: Download) => {
    const newDownload: Download = {
      ...download,
      id: Date.now().toString(),
      startedAt: new Date().toISOString(),
      progress: 0,
      speed: 0
    };
    setActiveDownloads(prev => [...prev, newDownload]);
    setDownloadHistory(prev => prev.filter(d => d.id !== download.id));
  }, []);

  const updateDownloadProgress = useCallback((downloadId: string, progress: number, speed: number) => {
    setActiveDownloads(prev =>
      prev.map(download =>
        download.id === downloadId
          ? { ...download, progress, speed }
          : download
      )
    );
  }, []);

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
        failDownload
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}; 