import {
  Box, FormControl, InputAdornment, InputLabel, ListSubheader,
  MenuItem, Select, TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

/**
 * Dropdown chọn nhân viên có thanh tìm kiếm bên trong.
 *
 * Props:
 *   value       – giá trị hiện tại (MaNV1)
 *   onChange    – handler (e) => void
 *   employees   – mảng { MaNV1, TenNV }
 *   label       – nhãn (default: 'Nhân viên')
 *   size        – 'small' | 'medium' (default: 'medium')
 *   fullWidth   – boolean (default: true)
 *   required    – boolean (default: false)
 */
const SearchableEmployeeSelect = ({
  value,
  onChange,
  employees = [],
  label = 'Nhân viên',
  size = 'medium',
  fullWidth = true,
  required = false,
}) => {
  const [search, setSearch] = useState('');

  const filtered = employees.filter((e) =>
    e.TenNV?.toLowerCase().includes(search.toLowerCase()) ||
    e.MaNV1?.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = () => setSearch('');

  return (
    <FormControl fullWidth={fullWidth} size={size} required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value ?? ''}
        label={label}
        onChange={onChange}
        onClose={handleClose}
        MenuProps={{
          PaperProps: { sx: { maxHeight: 360 } },
          autoFocus: false,
        }}
      >
        <ListSubheader sx={{ p: 1, lineHeight: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Tìm theo tên hoặc mã NV..."
            value={search}
            autoFocus
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </ListSubheader>

        {filtered.length === 0 ? (
          <MenuItem disabled>Không tìm thấy nhân viên</MenuItem>
        ) : (
          filtered.map((e) => (
            <MenuItem key={e.MaNV1} value={e.MaNV1}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{e.TenNV}</Typography>
                <Typography variant="caption" color="text.secondary">{e.MaNV1}</Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default SearchableEmployeeSelect;
