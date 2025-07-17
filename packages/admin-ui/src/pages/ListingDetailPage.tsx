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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Listing } from '../types';

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
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve');
  const [moderationReason, setModerationReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const queryClient = useQueryClient();

  // Fetch listing details
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => apiService.getListing(id!),
    enabled: !!id,
  });

  // Moderation mutation
  const moderationMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approve' | 'reject'; reason?: string }) =>
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

  const handleImageChange = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
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

  const currentImage = listing.images?.[selectedImageIndex] || '';

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

      {/* Title and Price */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {listing.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h3" fontWeight="bold" color="primary">
            ₺{listing.price.toLocaleString()}
          </Typography>
          <Chip label={listing.category} variant="outlined" />
        </Box>
      </Box>

      {/* Images Section */}
      {listing.images && listing.images.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Left Column - Images */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                {/* Main Image */}
                <Box sx={{ position: 'relative', height: 300, backgroundColor: '#f5f5f5' }}>
                  <img
                    src={currentImage}
                    alt={`İlan görseli ${selectedImageIndex + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {listing.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                    </>
                  )}
                </Box>

                {/* Image Counter */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedImageIndex + 1} / {listing.images.length} Fotoğraf
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">
                      Büyük Fotoğraf
                    </Button>
                    <Button size="small" variant="outlined">
                      Video
                    </Button>
                  </Box>
                </Box>

                {/* Thumbnails */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Grid container spacing={1}>
                    {listing.images.map((image, index) => (
                      <Grid item xs={3} sm={2} md={1.5} key={index}>
                        <Paper
                          sx={{
                            height: 60,
                            backgroundImage: `url(${image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            border: selectedImageIndex === index ? 2 : 1,
                            borderColor: selectedImageIndex === index ? 'primary.main' : 'divider',
                            '&:hover': {
                              borderColor: 'primary.main',
                            },
                          }}
                          onClick={() => handleImageChange(index)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - User Info */}
          <Grid item xs={12} md={4}>
            {listing.user && (
              <Card>
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
      )}

      {/* Details Section */}
      <Grid container spacing={3}>
        {/* Left Column - Listing Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                İlan Detayları
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                {listing.description}
              </Typography>

              {/* Listing Info Table */}
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', width: '30%' }}>
                        İlan No
                      </TableCell>
                      <TableCell>{listing.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        İlan Tarihi
                      </TableCell>
                      <TableCell>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Kategori
                      </TableCell>
                      <TableCell>{listing.category}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Durum
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[listing.status as keyof typeof statusLabels]}
                          color={statusColors[listing.status as keyof typeof statusColors]}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Görüntülenme
                      </TableCell>
                      <TableCell>{listing.views || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Favori
                      </TableCell>
                      <TableCell>{listing.favorites || 0}</TableCell>
                    </TableRow>
                    {listing.location && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                          Konum
                        </TableCell>
                        <TableCell>
                          {typeof listing.location === 'string' 
                            ? listing.location 
                            : `${listing.location.city}, ${listing.location.district}`
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Additional Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                İlan İstatistikleri
              </Typography>
              
              <List>
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
                      <Tag />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Kategori"
                    secondary={listing.category}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
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