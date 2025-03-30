import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useDownload } from '../context/DownloadContext';

interface TorrentResource {
  id: number;
  seeders: number;
  enclosure: string;
  site: string;
  torrent_name: string;
  description: string;
  pageurl: string;
  uploadvalue: number;
  downloadvalue: number;
  size: string;
  respix: string;
  restype: string;
  reseffect: string;
  releasegroup: string;
  video_encode: string;
  labels: string[];
}

interface MovieData {
  key: number;
  title: string;
  year: string;
  type_key: string;
  image: string;
  type: string;
  vote: string;
  tmdbid: string;
  backdrop: string;
  poster: string;
  overview: string;
  fav: string;
  rssid: string;
  torrent_dict: TorrentResource[];
}

// Mock data
const mockData: { [key: string]: MovieData } = {
  "阿甘正传 (1994)": {
    "key": 1,
    "title": "阿甘正传",
    "year": "1994",
    "type_key": "MOV",
    "image": "https://assets.fanart.tv/fanart/movies/13/moviethumb/forrest-gump-523a8535e69fa.jpg",
    "type": "电影",
    "vote": "8.5",
    "tmdbid": "13",
    "backdrop": "https://assets.fanart.tv/fanart/movies/13/moviethumb/forrest-gump-523a8535e69fa.jpg",
    "poster": "https://image.tmdb.org/t/p/w500/Ace1AhTTz2PQ2OVaX5mfZ7ey7Gv.jpg",
    "overview": "阿甘于二战结束后不久出生在美国南方阿拉巴马州一个闭塞的小镇，他先天弱智，智商只有75，然而他的妈妈是一个性格坚强的女性，她常常鼓励阿甘\"傻人有傻福\"，要他自强不息。阿甘像普通孩子一样上学，并且认识了一生的朋友和至爱珍妮，在珍妮和妈妈的爱护下，阿甘凭着上帝赐予的\"飞毛腿\"开始了一生不停的奔跑。阿甘成为橄榄球巨星、越战英雄、乒乓球外交使者、亿万富翁，但是，他始终忘不了珍妮，几次匆匆的相聚和离别，更是加深了阿甘的思念。有一天，阿甘收到珍妮的信，他们终于又要见面…",
    "fav": "0",
    "rssid": "",
    "torrent_dict": [
      {
        "id": 4,
        "seeders": 88,
        "enclosure": "https://hdarea.club/download.php?id=16745",
        "site": "HDArea",
        "torrent_name": "阿甘正传 Forrest Gump 1994 Bluray 2160p x265 10bit HDR 5Audios mUHD-FRDS",
        "description": "【阿甘正传/福雷斯特·冈普】 mUHD作品 4k HDR10版本 重制版本",
        "pageurl": "https://hdarea.club/details.php?id=16745&hit=1",
        "uploadvalue": 1,
        "downloadvalue": 0.5,
        "size": "22.63G",
        "respix": "2160p",
        "restype": "Bluray",
        "reseffect": "HDR",
        "releasegroup": "FRDS",
        "video_encode": "X265 10bit",
        "labels": []
      },
      {
        "id": 1,
        "seeders": 453,
        "enclosure": "https://hdarea.club/download.php?id=48361",
        "site": "HDArea",
        "torrent_name": "Forrest Gump 1994 BluRay 1080p x265 10bit 2Audio MNHD-FRDS",
        "description": "阿甘正传Top250 #13 获奥斯卡6项大奖 国英双语 10bit HEVC版本",
        "pageurl": "https://hdarea.club/details.php?id=48361&hit=1",
        "uploadvalue": 2,
        "downloadvalue": 1,
        "size": "7.26G",
        "respix": "1080p",
        "restype": "BluRay",
        "reseffect": "",
        "releasegroup": "FRDS",
        "video_encode": "X265 10bit",
        "labels": []
      }
    ]
  }
};

const MovieResourcesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addDownload } = useDownload();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [resources, setResources] = useState<TorrentResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    
    // Find movie in mock data
    const movieKey = Object.keys(mockData).find(key => mockData[key].tmdbid === id);
    
    if (movieKey && mockData[movieKey]) {
      setMovie(mockData[movieKey]);
      setResources(mockData[movieKey].torrent_dict);
    } else {
      setError('Movie not found');
    }
    
    setIsLoading(false);
  }, [id]);

  const handleDownload = async (resource: TorrentResource) => {
    try {
      // Add download to the download context
      addDownload({
        resourceId: resource.id.toString(),
        movieId: id || '',
        status: 'downloading',
        progress: 0,
        speed: 0,
        filePath: `/downloads/${resource.torrent_name}.torrent`
      });
      
      // Navigate to downloads page
      navigate('/downloads');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white">Loading resources...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !movie) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Movie not found'}</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:text-blue-400 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Movie
        </button>

        {/* Movie Header */}
        <div className="relative mb-8">
          <img 
            src={movie.image} 
            alt={movie.title}
            className="w-full h-[200px] object-cover rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-32 rounded-b-lg"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h1 className="text-xl font-bold text-white mb-1">{movie.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.type}</span>
              <span>•</span>
              <span className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">{movie.vote}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold mb-4">Available Resources</h2>
          
          {resources.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No resources available for this movie
            </div>
          ) : (
            resources.map((resource) => (
              <div key={resource.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm">{resource.torrent_name}</p>
                    <p className="text-gray-400 text-xs mt-1">{resource.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-gray-400 text-xs">{resource.respix}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{resource.video_encode}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{resource.size}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{resource.seeders} seeders</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(resource)}
                    className="bg-blue-500 text-white text-xs px-3 py-1 rounded ml-2 hover:bg-blue-600 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MovieResourcesPage; 