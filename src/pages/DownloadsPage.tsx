import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useDownload } from '../context/DownloadContext';

const DownloadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeDownloads, 
    downloadHistory, 
    cancelDownload, 
    retryDownload,
    updateDownloadProgress 
  } = useDownload();

  // Simulate download progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      activeDownloads.forEach(download => {
        if (download.status === 'downloading' && download.progress < 100) {
          updateDownloadProgress(
            download.id,
            Math.min(download.progress + 1, 100),
            Math.random() * 2 + 1 // Random speed between 1-3 MB/s
          );
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDownloads, updateDownloadProgress]);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Downloads</h1>
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Active Downloads */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Active Downloads</h2>
          <div className="space-y-4">
            {activeDownloads.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No active downloads
              </div>
            ) : (
              activeDownloads.map(download => (
                <div key={download.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-12 bg-gray-700 rounded"></div>
                      <div>
                        <h3 className="text-white text-sm">Movie Title</h3>
                        <p className="text-gray-400 text-xs">2.4 GB • 1080p</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => cancelDownload(download.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${download.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{download.progress}%</span>
                    <span className="text-gray-400">1.2 GB / 2.4 GB</span>
                    <span className="text-gray-400">{download.speed.toFixed(1)} MB/s</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Download History */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Download History</h2>
          <div className="space-y-4">
            {downloadHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No download history
              </div>
            ) : (
              downloadHistory.map(download => (
                <div key={download.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-12 bg-gray-700 rounded"></div>
                      <div>
                        <h3 className="text-white text-sm">Movie Title</h3>
                        <p className="text-gray-400 text-xs">
                          {download.status === 'completed' ? 'Completed' : 'Failed'} • 2.1 GB
                        </p>
                      </div>
                    </div>
                    {download.status === 'failed' && (
                      <button 
                        onClick={() => retryDownload(download)}
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DownloadsPage; 