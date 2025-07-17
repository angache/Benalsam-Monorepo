import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Eye,
  Edit,
  Delete,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  Heart,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Listing } from '../types';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`listings-tabpanel-${index}`}
      aria-labelledby={`listings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  PENDING: 'warning',
  REJECTED: 'error',
} as const;

const statusLabels = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Pasif',
  PENDING: 'Onay Bekliyor',
  REJECTED: 'Reddedildi',
} as const;

export const ListingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve');
  const [moderationReason, setModerationReason] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch listings
  const { data: listingsResponse, isLoading } = useQuery({
    queryKey: ['listings', { search: searchTerm, status: statusFilter }],
    queryFn: () => apiService.getListings({
      page: 1,
      limit: 100,
      search: searchTerm,
      filters: statusFilter !== 'ALL' ? { status: statusFilter } : undefined,
    }),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Moderation mutation
  const moderationMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approve' | 'reject'; reason?: string }) =>
      apiService.moderateListing(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setModerationDialog(false);
      setSelectedListing(null);
      setModerationReason('');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  const listings = listingsResponse?.data || [];
  const pendingListings = listings.filter(l => l.status === 'PENDING');
  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const rejectedListings = listings.filter(l => l.status === 'REJECTED');

  const handleModeration = () => {
    if (selectedListing) {
      moderationMutation.mutate({
        id: selectedListing.id,
        action: moderationAction,
        reason: moderationReason || undefined,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'title',
      headerName: 'Başlık',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.category}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'price',
      headerName: 'Fiyat',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          ₺{params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.value as keyof typeof statusLabels]}
          color={statusColors[params.value as keyof typeof statusColors]}
          size="small"
        />
      ),
    },
    {
      field: 'views',
      headerName: 'Görüntülenme',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Eye size={16} />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'favorites',
      headerName: 'Favori',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Heart size={16} />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Oluşturulma',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('tr-TR')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Görüntüle">
            <IconButton size="small" color="primary" onClick={() => navigate(`/listings/${params.row.id}`)}>
              <Eye size={16} />
            </IconButton>
          </Tooltip>
          
          {params.row.status === 'PENDING' && (
            <>
              <Tooltip title="Onayla">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => {
                    setSelectedListing(params.row);
                    setModerationAction('approve');
                    setModerationDialog(true);
                  }}
                >
                  <CheckCircle size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reddet">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setSelectedListing(params.row);
                    setModerationAction('reject');
                    setModerationDialog(true);
                  }}
                >
                  <XCircle size={16} />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          <Tooltip title="Düzenle">
            <IconButton size="small" color="info">
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Sil">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <Delete size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          İlan Yönetimi
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => alert('Export özelliği eklenecek')}
          >
            Dışa Aktar
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshCw />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['listings'] })}
          >
            Yenile
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Toplam İlan
              </Typography>
              <Typography variant="h4" component="div">
                {listings.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Onay Bekleyen
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                <Badge badgeContent={pendingListings.length} color="warning">
                  <AlertTriangle size={24} />
                </Badge>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Aktif İlanlar
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {activeListings.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Reddedilen
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                {rejectedListings.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="İlan Ara"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durum Filtresi</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum Filtresi"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  <MenuItem value="ACTIVE">Aktif</MenuItem>
                  <MenuItem value="PENDING">Onay Bekleyen</MenuItem>
                  <MenuItem value="INACTIVE">Pasif</MenuItem>
                  <MenuItem value="REJECTED">Reddedilen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Toplam: ${listings.length}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Onay Bekleyen: ${pendingListings.length}`}
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  label={`Aktif: ${activeListings.length}`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="İlan durumları"
          >
            <Tab
              label={
                <Badge badgeContent={pendingListings.length} color="warning">
                  Onay Bekleyen
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={activeListings.length} color="success">
                  Aktif İlanlar
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={rejectedListings.length} color="error">
                  Reddedilen
                </Badge>
              }
            />
            <Tab label="Tüm İlanlar" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <DataGrid
            rows={pendingListings}
            columns={columns}
            loading={isLoading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DataGrid
            rows={activeListings}
            columns={columns}
            loading={isLoading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DataGrid
            rows={rejectedListings}
            columns={columns}
            loading={isLoading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <DataGrid
            rows={listings}
            columns={columns}
            loading={isLoading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </TabPanel>
      </Card>

      {/* Moderation Dialog */}
      <Dialog open={moderationDialog} onClose={() => setModerationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          İlan {moderationAction === 'approve' ? 'Onaylama' : 'Reddetme'}
        </DialogTitle>
        <DialogContent>
          {selectedListing && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedListing.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fiyat: ₺{selectedListing.price.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kategori: {selectedListing.category}
              </Typography>
            </Box>
          )}
          
          {moderationAction === 'reject' && (
            <TextField
              fullWidth
              label="Red Nedeni"
              multiline
              rows={3}
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              placeholder="İlanı neden reddettiğinizi belirtin..."
            />
          )}
          
          {moderationMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              İşlem sırasında bir hata oluştu.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModerationDialog(false)}>
            İptal
          </Button>
          <Button
            onClick={handleModeration}
            variant="contained"
            color={moderationAction === 'approve' ? 'success' : 'error'}
            disabled={moderationMutation.isPending}
          >
            {moderationMutation.isPending ? 'İşleniyor...' : 
             moderationAction === 'approve' ? 'Onayla' : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 