import { apiRequest } from './api';
import { Download } from '../types';

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

/**
 * Initiates a download by searching for a resource by ID
 * @param resourceId The ID of the resource to download
 * @returns Promise with download information
 */
export async function initiateDownload(resourceId: string): Promise<DownloadSearchResponse> {
  return apiRequest<DownloadSearchResponse>('/download/search', {
    method: 'POST',
    urlEncoded: true,
    body: { id: resourceId }
  });
}

/**
 * Tracks the progress of an active download
 * @param downloadId The ID of the download to track
 * @returns Promise with download progress information
 */
export async function trackDownloadProgress(downloadId: string): Promise<any> {
  return apiRequest(`/download/status/${downloadId}`, {
    method: 'GET'
  });
}

/**
 * Cancels an active download
 * @param downloadId The ID of the download to cancel
 * @returns Promise with cancellation result
 */
export async function cancelDownloadRequest(downloadId: string): Promise<any> {
  return apiRequest(`/download/cancel/${downloadId}`, {
    method: 'POST'
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