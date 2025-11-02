import { apiRequest } from './http-client';

interface DownloadHistoryItem {
  id: string;
  orgid: string;
  tmdbid: string;
  title: string;
  type: string;
  media_type: string;
  year: string;
  vote: string;
  image: string;
  overview: string;
  date: string;
  site: string;
}

interface DownloadHistoryResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    Items: DownloadHistoryItem[];
  };
}

interface DownloadSearchResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    // The actual response structure will depend on the API
    // This is a placeholder based on other API responses in the project
    downloadId: string;
    resourceId: string;
    movieId: string;
    status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
    filePath?: string;
  };
}

interface DownloadInfoResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    torrents: DownloadInfo[];
  }
}

interface DownloadInfo {
  id: string;
  name: string;
  speed: string;
  state: string;
  site_url: string;
  progress: number;
}

/**
 * Initiates a download by searching for a resource by ID
 * @param resourceId The ID of the resource to download
 * @returns Promise with download information
 */
export async function initiateDownload(resourceId: string): Promise<DownloadSearchResponse> {
  return apiRequest<DownloadSearchResponse>('/download/search', {
    method: 'POST',
    urlEncoded: true,
    timeout: 30000,
    body: { id: resourceId }
  });
}

/**
 * Gets a list of all active downloads
 * @returns Promise with active downloads information
 */
export async function getActiveDownloads(): Promise<any> {
  return apiRequest('/download/now', {
    method: 'POST'
  });
}

/**
 * Gets the download history with pagination
 * @param page The page number to fetch
 * @returns Promise with download history information
 */
export async function getDownloadHistory(page: number = 1): Promise<DownloadHistoryResponse> {
  return apiRequest<DownloadHistoryResponse>('/download/history', {
    method: 'POST',
    urlEncoded: true,
    body: { page }
  });
}

/**
 * Removes a download from history
 * @param downloadId The ID of the download to remove
 * @returns Promise with removal result
 */
export async function removeDownload(downloadId: string): Promise<any> {
  return apiRequest('/download/remove', {
    method: 'POST',
    urlEncoded: true,
    body: { id: downloadId }
  });
}

/**
 * Starts a paused download
 * @param downloadId The ID of the download to start
 * @returns Promise with start result
 */
export async function startDownload(downloadId: string): Promise<any> {
  return apiRequest('/download/start', {
    method: 'POST',
    urlEncoded: true,
    body: { id: downloadId }
  });
}

/**
 * Pauses an active download
 * @param downloadId The ID of the download to pause
 * @returns Promise with pause result
 */
export async function stopDownload(downloadId: string): Promise<any> {
  return apiRequest('/download/stop', {
    method: 'POST',
    urlEncoded: true,
    body: { id: downloadId }
  });
}

/**
 * Gets detailed information about a specific download task or multiple tasks
 * @param downloadId The ID of the download to get information for, or multiple IDs separated by '|'
 * @returns Promise with detailed download information. When multiple IDs are provided,
 * the response will contain an array of download information objects.
 */
export async function getDownloadInfo(downloadId: string): Promise<DownloadInfoResponse> {
  return apiRequest('/download/info', {
    method: 'POST',
    urlEncoded: true,
    body: { ids: downloadId }
  });
}