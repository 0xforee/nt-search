import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDownload } from '../context/DownloadContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { activeDownloads } = useDownload();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        {children}
      </main>

      {/* Floating Download Button */}
      {activeDownloads.length > 0 && (
        <div className="fixed bottom-20 right-4">
          <button 
            onClick={() => navigate('/downloads')}
            className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg relative hover:bg-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeDownloads.length}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MainLayout; 