import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField,
  Button, 
  Paper,
  CircularProgress
} from '@mui/material';
import MultiSelectFilter from '../components/MultiSelectFilter';

interface FilterState {
  type: string[];
  year: string[];
  season: string[];
  sites: string[];
  quality: string[];
  resolution: string[];
  promotion: string[];
  rule: string[];
}

const AdvancedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState<FilterState>({
    type: ['全部'],
    year: ['全部'],
    season: ['全部'],
    sites: ['全部'],
    quality: ['全部'],
    resolution: ['全部'],
    promotion: ['全部'],
    rule: ['全部']
  });

  // Filter options
  const typeOptions = ['电影', '电视剧'];

  const yearOptions = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

  const seasonOptions = ['第1季', '第2季', '第3季', '第4季', '第5季', '第6季', '第7季', '第8季', '第9季', '第10季'];

  const siteOptions = ['柠檬', 'PTtime'];

  const qualityOptions = ['BLURAY', 'REMUX', 'DOLBY', 'WEB', 'HDTV', 'UHD', 'HDR', '3D'];

  const resolutionOptions = ['8k', '4k', '1080p', '720p'];

  const promotionOptions = ['普通', '免费', '2X', '2X免费', '50%', '2X 50%', '70%', '30%'];

  const ruleOptions = ['日常观影', '洗版收藏', '不过滤'];

  const handleFilterChange = (field: keyof FilterState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (value === '全部') {
      if (checked) {
        // Select only '全部' and clear all other options
        setFilters(prev => ({ ...prev, [field]: ['全部'] }));
      } else {
        // Deselect '全部'
        setFilters(prev => ({ ...prev, [field]: [] }));
      }
    } else {
      // Handle other options
      setFilters(prev => {
        const currentField = prev[field] as string[];
        if (checked) {
          // If selecting an option, first remove '全部' if it exists, then add the option
          const filteredField = currentField.filter(item => item !== '全部');
          return { ...prev, [field]: [...filteredField, value] };
        } else {
          // If deselecting an option, just remove it
          return { ...prev, [field]: currentField.filter((item: string) => item !== value) };
        }
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Build search parameters
    const searchParams = new URLSearchParams();
    
    if (searchQuery.trim()) {
      searchParams.append('q', searchQuery.trim());
    }
    if (filters.type.length > 0 && !filters.type.includes('全部')) {
      searchParams.append('type', filters.type.join(','));
    }
    if (filters.year.length > 0 && !filters.year.includes('全部')) {
      searchParams.append('year', filters.year.join(','));
    }
    if (filters.season.length > 0 && !filters.season.includes('全部')) {
      searchParams.append('season', filters.season.join(','));
    }
    if (filters.sites.length > 0 && !filters.sites.includes('全部')) {
      searchParams.append('sites', filters.sites.join(','));
    }
    if (filters.quality.length > 0 && !filters.quality.includes('全部')) {
      searchParams.append('quality', filters.quality.join(','));
    }
    if (filters.resolution.length > 0 && !filters.resolution.includes('全部')) {
      searchParams.append('resolution', filters.resolution.join(','));
    }
    if (filters.promotion.length > 0 && !filters.promotion.includes('全部')) {
      searchParams.append('promotion', filters.promotion.join(','));
    }
    if (filters.rule.length > 0 && !filters.rule.includes('全部')) {
      searchParams.append('rule', filters.rule.join(','));
    }
    
    // Navigate to search results with advanced parameters
    navigate(`/search?${searchParams.toString()}`);
    setIsSearching(false);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        高级搜索
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          搜索条件
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Type Filter */}
          <MultiSelectFilter
            label="类型"
            options={typeOptions}
            selectedOptions={filters.type}
            onChange={handleFilterChange('type')}
          />

          {/* Year Filter */}
          <MultiSelectFilter
            label="年份"
            options={yearOptions}
            selectedOptions={filters.year}
            onChange={handleFilterChange('year')}
          />

          {/* Season Filter */}
          <MultiSelectFilter
            label="季"
            options={seasonOptions}
            selectedOptions={filters.season}
            onChange={handleFilterChange('season')}
          />

          {/* Sites Filter */}
          <MultiSelectFilter
            label="站点"
            options={siteOptions}
            selectedOptions={filters.sites}
            onChange={handleFilterChange('sites')}
          />

          {/* Quality Filter */}
          <MultiSelectFilter
            label="质量"
            options={qualityOptions}
            selectedOptions={filters.quality}
            onChange={handleFilterChange('quality')}
          />

          {/* Resolution Filter */}
          <MultiSelectFilter
            label="分辨率"
            options={resolutionOptions}
            selectedOptions={filters.resolution}
            onChange={handleFilterChange('resolution')}
          />

          {/* Promotion Filter */}
          <MultiSelectFilter
            label="促销"
            options={promotionOptions}
            selectedOptions={filters.promotion}
            onChange={handleFilterChange('promotion')}
          />

          {/* Rule Filter */}
          <MultiSelectFilter
            label="过滤规则"
            options={ruleOptions}
            selectedOptions={filters.rule}
            onChange={handleFilterChange('rule')}
          />
        </Box>
      </Paper>

      {/* Search Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          搜索关键字
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            label="搜索关键字"
            placeholder="输入搜索关键字..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSearching || !searchQuery.trim()}
            sx={{ minWidth: 120, height: 56 }}
          >
            {isSearching ? <CircularProgress size={24} color="inherit" /> : '搜索'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdvancedSearchPage;
