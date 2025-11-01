import { TorrentInfo, MediaTorrentsAPIResponse } from '../services/api';

/**
 * Process TV show search results
 * Temporarily returns original data structure
 */
export function processTVResources(
  searchResults: MediaTorrentsAPIResponse
): TorrentInfo[] {
  const allTorrents: TorrentInfo[] = [];

  if (searchResults.success && searchResults.data) {
    Object.values(searchResults.data.result).forEach((tvData) => {
      if (tvData.torrent_dict) {
        tvData.torrent_dict.forEach((entry) => {
          if (Array.isArray(entry) && entry.length > 1) {
            const [_, categories] = entry;
            Object.values(categories).forEach((category) => {
              if (category.group_torrents) {
                Object.values(category.group_torrents).forEach((group) => {
                  if (group.torrent_list) {
                    allTorrents.push(...group.torrent_list);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  return allTorrents;
}

