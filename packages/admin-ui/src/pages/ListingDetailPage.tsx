import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowLeft,
  Eye,
  Edit,
  Delete,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Heart,
  MapPin,
  Calendar,
  User,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Phone,
  Mail,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Listing } from '../types';

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
      id={`listing-detail-tabpanel-${index}`}
      aria-labelledby={`listing-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p:3}}>{children}</Box>}
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

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve');
  const [moderationReason, setModerationReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch listing details
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => apiService.getListing(id!),
    enabled: !!id,
  });

  // Moderation mutation
  const moderationMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approve' | 'reject';reason?: string }) =>
      apiService.moderateListing(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setModerationDialog(false);
      setModerationReason('');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      navigate('/listings');
    },
  });

  const handleModeration = () => {
    if (listing) {
      moderationMutation.mutate({
        id: listing.id,
        action: moderationAction,
        reason: moderationReason || undefined,
      });
    }
  };

  const handleDelete = () => {
    if (listing) {
      deleteMutation.mutate(listing.id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  if (error || !listing) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">İlan bulunamadı veya yüklenirken hata oluştu.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/listings')}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h4" component="h1">
           İlan Detayı
        </Typography>
        <Chip
          label={statusLabels[listing.status as keyof typeof statusLabels]}
          color={statusColors[listing.status as keyof typeof statusColors]}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {listing.status === 'PENDING' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => {
                setModerationAction('approve');
                setModerationDialog(true);
              }}
            >
              Onayla
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<XCircle />}
              onClick={() => {
                setModerationAction('reject');
                setModerationDialog(true);
              }}
            >
              Reddet
            </Button>
          </>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => setDeleteDialog(true)}
        >
          Sil
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Basic Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {listing.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  ₺{listing.price.toLocaleString()}
                </Typography>
                <Chip label={listing.category} variant="outlined" />
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                {listing.description}
              </Typography>

              {/* Images */}
              {listing.images && listing.images.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Görseller ({listing.images.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {listing.images.slice(0, 6).map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Paper
                          sx={{
                            height: 120,
                            backgroundImage: `url(${image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {index === 5 && listing.images.length > 6 && (
                            <Badge badgeContent={`+${listing.images.length - 6}`} color="primary">
                              <ImageIcon />
                            </Badge>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                İlan Bilgileri
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Tag />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Kategori"
                    secondary={listing.category}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Calendar />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Oluşturulma"
                    secondary={new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Eye />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Görüntülenme"
                    secondary={listing.views || 0}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Heart />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Favori"
                    secondary={listing.favorites || 0}
                  />
                </ListItem>

                {listing.location && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <MapPin />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Konum"
                      secondary={typeof listing.location === 'string' ? listing.location : `${listing.location.city}, ${listing.location.district}`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* User Info */}
          {listing.user && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Kullanıcı Bilgileri
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <User />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Kullanıcı"
                      secondary={listing.user.name || listing.user.email}
                    />
                  </ListItem>

                  {listing.user.phone && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <Phone />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Telefon"
                        secondary={listing.user.phone}
                      />
                    </ListItem>
                  )}

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Mail />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="E-posta"
                      secondary={listing.user.email}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Moderation Dialog */}
      <Dialog open={moderationDialog} onClose={() => setModerationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {moderationAction === 'approve' ? 'İlanı Onayla' : 'İlanı Reddet'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Sebep (Opsiyonel)"
            value={moderationReason}
            onChange={(e) => setModerationReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModerationDialog(false)}>İptal</Button>
          <Button
            onClick={handleModeration}
            variant="contained"
            color={moderationAction === 'approve' ? 'success' : 'error'}
            disabled={moderationMutation.isPending}
          >
            {moderationMutation.isPending ? 'İşleniyor...' : (moderationAction === 'approve' ? 'Onayla' : 'Reddet')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>İlanı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>İptal</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 