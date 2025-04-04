// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  permissions?: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Movie related types
export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  overview: string;
  posterPath: string;
  backdropPath?: string;
  releaseDate: string;
  runtime: number;
  voteAverage: number;
  voteCount: number;
  genres: Genre[];
  status: 'released' | 'upcoming' | 'in_production';
  type: 'movie' | 'tv';
}

export interface TorrentResource {
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

export interface MovieData {
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

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: string;
  name: string;
  character: string;
  profilePath?: string;
  order: number;
}

// Resource related types
export interface Resource {
  id: string;
  movieId: string;
  title: string;
  quality: '2160p' | '1080p' | '720p' | '480p';
  codec: 'HEVC' | 'H264' | 'H265';
  size: number;
  format: string;
  audio: string[];
  subtitles: string[];
  uploadDate: string;
  seeders: number;
  leechers: number;
  magnetLink: string;
}

// Download related types
export interface Download {
  id: string;
  resourceId: string;
  movieId: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  progress: number;
  speed: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  filePath?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  totalPages: number;
  totalResults: number;
}

// Search related types
export interface SearchParams {
  query: string;
  page?: number;
  type?: 'movie' | 'tv' | 'all';
  genre?: number[];
  year?: number;
  sortBy?: 'popularity' | 'rating' | 'date';
  order?: 'asc' | 'desc';
}

// UI related types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface SearchItem {
  id: number;
  title: string;
  year: string | null;
  type: string;
  media_type: string;
  vote: number;
  image: string;
  overview: string;
  poster: string;
  category: string;
  original_title: string;
  release_date: string;
}

export interface SearchResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    Items: SearchItem[];
  };
}

export interface MovieFact {
  [key: string]: string;
}

export interface MovieCrew {
  [key: string]: string;
}

export interface MovieActor {
  id: number;
  gender: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  image: string;
  cast_id: number;
  role: string;
  credit_id: string;
  order: number;
  profile: string;
}

export interface MovieDetails {
  tmdbid: number;
  douban_id: number;
  background: string[];
  image: string;
  vote: number;
  year: string;
  title: string;
  genres: string;
  overview: string;
  runtime: string;
  fact: MovieFact[];
  crews: MovieCrew[];
  actors: MovieActor[];
  link: string;
  douban_link: string;
  fav: string;
  item_url: string | null;
  rssid: string;
  seasons: any[];
}

export interface MovieDetailsResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    data: MovieDetails;
  };
} 