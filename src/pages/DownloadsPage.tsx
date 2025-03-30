import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useDownload } from '../context/DownloadContext';
import { Download } from '../types';

const DownloadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeDownloads, 
    downloadHistory, 
    cancelDownload, 
    retryDownload,
    updateDownloadProgress,
    fetchActiveDownloads 
  } = useDownload();

  // Fetch active downloads when component mounts
  useEffect(() => {
    fetchActiveDownloads();
    
    // Set up polling for active downloads
    const interval = setInterval(() => {
      fetchActiveDownloads();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [fetchActiveDownloads]);

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
              activeDownloads.map(download => {
                // Extract title and image from the download object if available
                const title = (download as any).title || 'Movie Title';
                const image = (download as any).image || '';
                const name = (download as any).name || '';
                const state = (download as any).state || download.status;
                const speedText = typeof download.speed === 'string' ? download.speed : `${download.speed.toFixed(1)} MB/s`;
                
                return (
                  <div key={download.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {image ? (
                          <img src={image} alt={title} className="w-8 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-12 bg-gray-700 rounded"></div>
                        )}
                        <div>
                          <h3 className="text-white text-sm">{title}</h3>
                          <p className="text-gray-400 text-xs">{name}</p>
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
                        className={`${state === 'Stoped' ? 'bg-yellow-500' : 'bg-blue-500'} h-1.5 rounded-full transition-all duration-300`} 
                        style={{ width: `${download.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{download.progress}%</span>
                      <span className="text-gray-400">{state}</span>
                      <span className="text-gray-400">{speedText}</span>
                    </div>
                  </div>
                );
              })
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
              downloadHistory.map(download => {
                // Extract title and image from the download object if available
                const title = (download as any).title || 'Movie Title';
                const image = (download as any).image || '';
                const name = (download as any).name || '';
                
                return (
                  <div key={download.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {image ? (
                          <img src={image} alt={title} className="w-8 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-12 bg-gray-700 rounded"></div>
                        )}
                        <div>
                          <h3 className="text-white text-sm">{title}</h3>
                          <p className="text-gray-400 text-xs">
                            {download.status === 'completed' ? 'Completed' : 'Failed'} • {name}
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DownloadsPage;