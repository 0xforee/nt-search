import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDownload } from '../context/DownloadContext';
import { Download } from '../types';

const DownloadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeDownloads, 
    downloadHistory, 
    apiDownloadHistory,
    retryDownload,
    removeDownload,
    updateDownloadProgress,
    fetchActiveDownloads,
    fetchDownloadHistory,
    currentHistoryPage,
    totalHistoryPages,
    startPausedDownload,
    pauseActiveDownload
  } = useDownload();
  
  const [historyPage, setHistoryPage] = useState(1);

  // Fetch active downloads and history when component mounts
  useEffect(() => {
    fetchActiveDownloads();
    fetchDownloadHistory(historyPage);
    
    // Removed automatic polling of 'download/now' endpoint
    // Downloads will update only when user-initiated actions occur
  }, [fetchActiveDownloads, fetchDownloadHistory, historyPage]);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  return (
      <div className="container mx-auto px-4 py-8">
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
                const speedText = typeof download.speed === 'string' ? download.speed : `${download.speed} MB/s`;
                
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
                      <div className="flex items-center gap-2">
                        {/* Play/Pause Button */}
                        {state === 'paused' || state === 'Stoped' ? (
                          <button 
                            onClick={() => startPausedDownload(download.id)}
                            className="text-green-500 hover:text-green-400 transition-colors"
                            title="Start Download"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ) : (
                          <button 
                            onClick={() => pauseActiveDownload(download.id)}
                            className="text-yellow-500 hover:text-yellow-400 transition-colors"
                            title="Pause Download"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button 
                          onClick={() => removeDownload(download.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Remove Download"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
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

        {/* Local Download History */}
        {downloadHistory.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Downloads</h2>
            <div className="space-y-4">
              {downloadHistory.map(download => {
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
                      <div className="flex items-center gap-2">
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* API Download History */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Download History</h2>
          <div className="space-y-4">
            {apiDownloadHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No download history
              </div>
            ) : (
              apiDownloadHistory.map((item: any) => {
                return (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-8 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-12 bg-gray-700 rounded"></div>
                        )}
                        <div>
                          <h3 className="text-white text-sm">{item.title}</h3>
                          <p className="text-gray-400 text-xs">
                            {item.media_type} • {item.year} • {item.site}
                          </p>
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                            {item.overview}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Downloaded on {item.date}
                          </p>
                        </div>
                      </div>
                      {/* Remove button removed as history cannot be deleted */}
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Pagination */}
            {apiDownloadHistory.length > 0 && totalHistoryPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (historyPage > 1) {
                        const newPage = historyPage - 1;
                        setHistoryPage(newPage);
                        fetchDownloadHistory(newPage);
                      }
                    }}
                    disabled={historyPage <= 1}
                    className={`px-3 py-1 rounded ${historyPage <= 1 ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-gray-700 rounded text-white">
                    {historyPage} / {totalHistoryPages}
                  </span>
                  <button
                    onClick={() => {
                      if (historyPage < totalHistoryPages) {
                        const newPage = historyPage + 1;
                        setHistoryPage(newPage);
                        fetchDownloadHistory(newPage);
                      }
                    }}
                    disabled={historyPage >= totalHistoryPages}
                    className={`px-3 py-1 rounded ${historyPage >= totalHistoryPages ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default DownloadsPage;