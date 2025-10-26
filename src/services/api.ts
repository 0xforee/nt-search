import { ApiResponse } from "../types/Response";
import { apiRequest } from "./http-client";



/**
 * search api
 */

export interface RspSearchItem {
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

export interface RspSearchResponse {
    Items: RspSearchItem[];
}
  
async function searchMedia(parameters: any) : Promise<ApiResponse<RspSearchResponse>>{
    const response = await apiRequest<ApiResponse<RspSearchResponse>>('/recommend/list', {
        method: 'POST',
        urlEncoded: true,
        body: parameters
      });
      return response;
}

async function searchTorrentsAsync(keyword: string) : Promise<ApiResponse<any>>{
    const response = await apiRequest<ApiResponse<any>>('/search/keyword', {
        method: 'POST',
        urlEncoded: true,
        body: { search_word: keyword },
        timeout: 30000
      });
      return response;
}

// Main Movie Torrent API response interface

export interface TorrentInfo {
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
    releasegroup: string | null;
    video_encode: string;
    labels: any[];
}

export interface TorrentGroup {
    unique_info: {
        video_encode: string;
        size: string;
        reseffect: string;
        releasegroup: string | null;
    };
    torrent_list: TorrentInfo[];
}

export interface TorrentsByType {
    [group: string]: TorrentGroup;
}

export interface TorrentCategory {
    group_info: {
        respix: string;
        restype: string;
    };
    group_total: number;
    group_torrents: TorrentsByType;
}

export type TorrentDictEntry = [string, { [category: string]: TorrentCategory }];

// The top-level movie detail object (simplified, core fields for media resources)
export interface MovieTorrentResource {
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
    torrent_dict: TorrentDictEntry[];
    filter: {
        site: string[];
        free: { value: string; name: string }[];
        releasegroup: string[];
        respix: string[];
        video: string[];
        season: any[];
    };
}

export interface MediaTorrentAPIResult {
    [title: string]: MovieTorrentResource;
}

export interface MediaTorrentsAPIResponseData {
    total: number;
    result: MediaTorrentAPIResult;
}

export interface MediaTorrentsAPIResponse extends ApiResponse<MediaTorrentsAPIResponseData> {}


async function getSearchTorrents() : Promise<MediaTorrentsAPIResponse>{
    const response = await apiRequest<MediaTorrentsAPIResponse>('/search/result', {
        method: 'POST',
        urlEncoded: true,
      });
      return response;
}



export { searchMedia, searchTorrentsAsync, getSearchTorrents }