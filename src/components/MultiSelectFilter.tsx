import React from 'react';
import { Box, Typography, Checkbox, FormGroup, FormControlLabel } from '@mui/material';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  options,
  selectedOptions,
  onChange,
}) => {
  const handleAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // If 'All' is checked, select only 'All' (parent component will handle clearing others)
      onChange({ target: { value: '全部', checked: true } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      // If 'All' is unchecked, deselect 'All' itself
      onChange({ target: { value: '全部', checked: false } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value === '全部') {
      onChange(event);
    } else {
      // If any other option is selected, deselect 'All' first
      if (selectedOptions.includes('全部')) {
        onChange({ target: { value: '全部', checked: false } } as React.ChangeEvent<HTMLInputElement>);
      }
      onChange(event);
    }
  };

  const isAllSelected = selectedOptions.includes('全部');

  return (
    <Box>
      
      <FormGroup row>
        <Typography variant="subtitle1" gutterBottom style={{ marginRight: 26 }}>{label}</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllSelected}
              onChange={handleAllChange}
              value="全部"
              sx={{ display: 'none' }}
            />
          }
          label={
            <span
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                backgroundColor: isAllSelected ? '#3B82F6' : 'transparent',
                color: isAllSelected ? 'white' : 'inherit',
              }}
            >
              全部
            </span>
          }
        />
        {options.map((option) => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                checked={selectedOptions.includes(option) && !isAllSelected}
                onChange={handleOptionChange}
                value={option}
                sx={{ display: 'none' }}
              />
            }
            label={
              <span
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                  backgroundColor: selectedOptions.includes(option) && !isAllSelected ? '#3B82F6' : 'transparent',
                  color: selectedOptions.includes(option) && !isAllSelected ? 'white' : 'inherit',
                }}
              >
                {option}
              </span>
            }
          />
        ))}
      </FormGroup>
    </Box>
  );
};

export default MultiSelectFilter;