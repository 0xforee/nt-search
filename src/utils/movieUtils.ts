import { TorrentInfo, MediaTorrentsAPIResponse } from '../services/api';

export interface GroupedResources {
  '4k': TorrentInfo[];
  '2k': TorrentInfo[];
  '1080p': TorrentInfo[];
  'other': TorrentInfo[];
}

export interface ProcessedMovieResources {
  hasResources: boolean;
  hasSeeders: boolean; // true if there are resources with seeders > 0
  groupedResources: GroupedResources;
}

/**
 * Extract torrent_name without version/size variations to identify duplicates
 */
function getTorrentBaseName(torrent: TorrentInfo): string {
  // Remove common variations like size, year variations, etc.
  // This is a simple approach - can be refined
  let name = torrent.torrent_name;
  // Remove year variations at the end
  name = name.replace(/\s+\d{4}\s*$/g, '');
  // Remove common size patterns
  name = name.replace(/\s+\d+\.?\d*[GM]B?\s*$/gi, '');
  return name.toLowerCase().trim();
}

/**
 * Merge resources with the same name, keeping the one with more seeders
 */
function mergeDuplicateResources(torrents: TorrentInfo[]): TorrentInfo[] {
  const nameMap = new Map<string, TorrentInfo>();

  torrents.forEach((torrent) => {
    const baseName = getTorrentBaseName(torrent);
    const existing = nameMap.get(baseName);

    if (!existing || torrent.seeders > existing.seeders) {
      nameMap.set(baseName, torrent);
    }
  });

  return Array.from(nameMap.values());
}

/**
 * Determine resolution category from respix
 */
function getResolutionCategory(respix: string): keyof GroupedResources {
  const normalized = respix.toLowerCase().trim();

  if (normalized.includes('2160p') || normalized.includes('4k') || normalized.includes('uhd')) {
    return '4k';
  }
  if (normalized.includes('1440p') || normalized.includes('2k')) {
    return '2k';
  }
  if (normalized.includes('1080p')) {
    return '1080p';
  }
  return 'other';
}

/**
 * Group torrents by resolution
 */
function groupByResolution(torrents: TorrentInfo[]): GroupedResources {
  const grouped: GroupedResources = {
    '4k': [],
    '2k': [],
    '1080p': [],
    'other': [],
  };

  torrents.forEach((torrent) => {
    const category = getResolutionCategory(torrent.respix || 'other');
    grouped[category].push(torrent);
  });

  return grouped;
}

/**
 * Process movie search results
 * First groups by seeders (seeders > 0 vs seeders = 0)
 * Then groups by resolution within each group
 */
export function processMovieResources(
  searchResults: MediaTorrentsAPIResponse
): ProcessedMovieResources {
  // Extract all torrents from the search results
  const allTorrents: TorrentInfo[] = [];

  if (searchResults.success && searchResults.data) {
    Object.values(searchResults.data.result).forEach((movieData) => {
      if (movieData.torrent_dict) {
        movieData.torrent_dict.forEach((entry) => {
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

  // No resources found
  if (allTorrents.length === 0) {
    return {
      hasResources: false,
      hasSeeders: false,
      groupedResources: {
        '4k': [],
        '2k': [],
        '1080p': [],
        'other': [],
      },
    };
  }

  // Merge duplicate resources (same name, keep the one with more seeders)
  const mergedTorrents = mergeDuplicateResources(allTorrents);

  // Group by seeders: seeders > 0 vs seeders = 0
  const torrentsWithSeeders = mergedTorrents.filter((torrent) => torrent.seeders > 0);
  const torrentsWithoutSeeders = mergedTorrents.filter((torrent) => torrent.seeders === 0);

  // Determine which group to use (prioritize seeders > 0)
  let resourcesToGroup: TorrentInfo[] = [];
  let hasSeeders = false;

  if (torrentsWithSeeders.length > 0) {
    // Use resources with seeders > 0
    resourcesToGroup = torrentsWithSeeders;
    hasSeeders = true;
  } else if (torrentsWithoutSeeders.length > 0) {
    // Use resources with seeders = 0
    resourcesToGroup = torrentsWithoutSeeders;
    hasSeeders = false;
  } else {
    // No resources (shouldn't happen, but handle it)
    return {
      hasResources: false,
      hasSeeders: false,
      groupedResources: {
        '4k': [],
        '2k': [],
        '1080p': [],
        'other': [],
      },
    };
  }

  // Group by resolution
  const groupedResources = groupByResolution(resourcesToGroup);

  return {
    hasResources: true,
    hasSeeders,
    groupedResources,
  };
}

/**
 * Check if resolution is 4k or 1080p
 */
function isHighQualityResolution(respix: string): boolean {
  const normalized = respix.toLowerCase().trim();
  return (
    normalized.includes('2160p') ||
    normalized.includes('4k') ||
    normalized.includes('uhd') ||
    normalized.includes('1080p')
  );
}

/**
 * Check if resolution is 1080p
 */
function is1080pResolution(respix: string): boolean {
  const normalized = respix.toLowerCase().trim();
  return normalized.includes('1080p');
}

/**
 * Get resolution priority for sorting (higher number = higher priority)
 */
function getResolutionPriority(respix: string): number {
  const normalized = respix.toLowerCase().trim();
  if (normalized.includes('2160p') || normalized.includes('4k') || normalized.includes('uhd')) {
    return 4; // 4k is highest
  }
  if (normalized.includes('1080p')) {
    return 3; // 1080p is second
  }
  if (normalized.includes('1440p') || normalized.includes('2k')) {
    return 2; // 2k is third
  }
  return 1; // other is lowest
}

/**
 * Sort torrents by resolution (descending) and then by seeders (descending)
 */
function sortByResolutionAndSeeders(torrents: TorrentInfo[]): TorrentInfo[] {
  return [...torrents].sort((a, b) => {
    const resolutionA = getResolutionPriority(a.respix || 'other');
    const resolutionB = getResolutionPriority(b.respix || 'other');
    
    // First sort by resolution (descending)
    if (resolutionA !== resolutionB) {
      return resolutionB - resolutionA;
    }
    
    // Then sort by seeders (descending)
    return b.seeders - a.seeders;
  });
}

/**
 * Find recommended resource with fallback strategy
 */
export function findRecommendedResource(
  searchResults: MediaTorrentsAPIResponse
): TorrentInfo | null {
  // Extract all torrents from the search results
  const allTorrents: TorrentInfo[] = [];

  if (searchResults.success && searchResults.data) {
    Object.values(searchResults.data.result).forEach((movieData) => {
      if (movieData.torrent_dict) {
        movieData.torrent_dict.forEach((entry) => {
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

  if (allTorrents.length === 0) {
    return null;
  }

  // Merge duplicate resources
  const mergedTorrents = mergeDuplicateResources(allTorrents);

  // Try different priority levels
  const priorityFilters = [
    // Priority 1: releasegroup != null AND (4k OR 1080p) AND seeders > 10
    (t: TorrentInfo) =>
      t.releasegroup != null &&
      t.releasegroup.trim() !== '' &&
      isHighQualityResolution(t.respix || '') &&
      t.seeders > 10,
    
    // Priority 2: releasegroup != null AND (4k OR 1080p) AND seeders > 0
    (t: TorrentInfo) =>
      t.releasegroup != null &&
      t.releasegroup.trim() !== '' &&
      isHighQualityResolution(t.respix || '') &&
      t.seeders > 0,
    
    // Priority 3: releasegroup != null AND (4k OR 1080p) AND seeders >= 0
    (t: TorrentInfo) =>
      t.releasegroup != null &&
      t.releasegroup.trim() !== '' &&
      isHighQualityResolution(t.respix || ''),
    
    // Priority 4: releasegroup != null AND 1080p AND seeders > 10
    (t: TorrentInfo) =>
      t.releasegroup != null &&
      t.releasegroup.trim() !== '' &&
      is1080pResolution(t.respix || '') &&
      t.seeders > 10,
    
    // Priority 5: releasegroup != null AND 1080p AND seeders > 0
    (t: TorrentInfo) =>
      t.releasegroup != null &&
      t.releasegroup.trim() !== '' &&
      is1080pResolution(t.respix || '') &&
      t.seeders > 0,
    
    // Priority 6: releasegroup != null AND 1080p AND seeders >= 0
    (t: TorrentInfo) =>
      t.releasegroup != null &&
      t.releasegroup.trim() !== '' &&
      is1080pResolution(t.respix || ''),
    
    // Priority 7: releasegroup != null AND seeders > 10
    (t: TorrentInfo) =>
      t.releasegroup != null &&
      t.releasegroup.trim() !== '' &&
      t.seeders > 10,
    
    // Priority 8: releasegroup != null AND seeders > 0
    (t: TorrentInfo) =>
      t.releasegroup != null &&
      t.releasegroup.trim() !== '' &&
      t.seeders > 0,
    
    // Priority 9: releasegroup != null AND seeders >= 0
    (t: TorrentInfo) =>
      t.releasegroup != null && t.releasegroup.trim() !== '',
    
    // Priority 10: (4k OR 1080p) AND seeders > 10
    (t: TorrentInfo) =>
      isHighQualityResolution(t.respix || '') && t.seeders > 10,
    
    // Priority 11: (4k OR 1080p) AND seeders > 0
    (t: TorrentInfo) =>
      isHighQualityResolution(t.respix || '') && t.seeders > 0,
    
    // Priority 12: (4k OR 1080p) AND seeders >= 0
    (t: TorrentInfo) => isHighQualityResolution(t.respix || ''),
    
    // Priority 13: seeders > 10
    (t: TorrentInfo) => t.seeders > 10,
    
    // Priority 14: seeders > 0
    (t: TorrentInfo) => t.seeders > 0,
    
    // Priority 15: seeders >= 0 (any resource)
    (_t: TorrentInfo) => true,
  ];

  // Try each priority level
  for (const filter of priorityFilters) {
    const filtered = mergedTorrents.filter(filter);
    if (filtered.length > 0) {
      // Sort by resolution and seeders, then return the first one
      const sorted = sortByResolutionAndSeeders(filtered);
      return sorted[0];
    }
  }

  // Fallback: return null if no resource found (shouldn't happen with priority 15)
  return null;
}

