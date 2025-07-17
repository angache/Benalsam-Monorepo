import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowLeft,
  Edit,
  Delete,
  Folder,
  Settings,
  Plus,
  Eye,
  List as ListIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService, type Category } from '../services/categoryService';
import { getIconComponent } from '../utils/iconUtils';
import { getColorStyle, getColorName } from '../utils/colorUtils';

export const CategoryDetailPage: React.FC = () => {
  const { path } = useParams<{ path: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch category
  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', path],
    queryFn: () => categoryService.getCategory(path!),
    enabled: !!path,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (path: string) => categoryService.deleteCategory(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigate('/categories');
    },
  });

  const handleDelete = () => {
    if (window.confirm(`"${category?.name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(path!);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Kategori yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!category) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Kategori bulunamadı.
        </Alert>
      </Box>
    );
  }

  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const hasAttributes = category.attributes && category.attributes.length > 0;
  const isLeaf = !hasSubcategories;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/categories')}>
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="h4" component="h1">
            {category.name}
          </Typography>
          <Chip
            label={isLeaf ? 'Son Kategori' : 'Ana Kategori'}
            color={isLeaf ? 'primary' : 'secondary'}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/categories/${encodeURIComponent(path!)}/edit`)}
          >
            Düzenle
          </Button>
          {isLeaf && (
            <Button
              variant="contained"
              startIcon={<ListIcon />}
              onClick={() => navigate(`/categories/${encodeURIComponent(path!)}/attributes`)}
            >
              Özellikleri Düzenle
            </Button>
          )}
          {!isLeaf && (
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => navigate(`/categories/${encodeURIComponent(path!)}/add-subcategory`)}
            >
              Alt Kategori Ekle
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Sil
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Category Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kategori Bilgileri
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    background: getColorStyle(category.color),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                  }}
                >
                  {(() => {
                    const IconComponent = getIconComponent(category.icon);
                    return <IconComponent size={30} />;
                  })()}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    İkon: {category.icon} • Renk: {getColorName(category.color)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Alt Kategoriler
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {category.subcategories?.length || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {isLeaf ? 'Özellikler' : 'Alt Kategoriler'}
                  </Typography>
                  <Typography variant="h6" color="secondary.main">
                    {isLeaf ? (category.attributes?.length || 0) : (category.subcategories?.length || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Subcategories */}
        {hasSubcategories && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alt Kategoriler
                </Typography>
                
                <List dense>
                  {category.subcategories!.map((subcategory) => (
                    <ListItem
                      key={subcategory.name}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Görüntüle">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/categories/${encodeURIComponent(path!)}/${encodeURIComponent(subcategory.name)}`)}
                            >
                              <Eye size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/categories/${encodeURIComponent(path!)}/${encodeURIComponent(subcategory.name)}/edit`)}
                            >
                              <Edit size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            background: subcategory.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <Folder size={16} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={subcategory.name}
                        secondary={`${subcategory.subcategories?.length || 0} alt kategori • ${subcategory.attributes?.length || 0} özellik`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Attributes - Only show for leaf categories */}
        {hasAttributes && isLeaf && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Kategori Özellikleri
                </Typography>
                
                <Grid container spacing={2}>
                  {category.attributes!.map((attribute) => (
                    <Grid item xs={12} sm={6} md={4} key={attribute.key}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            {attribute.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Anahtar: {attribute.key}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Tip: {attribute.type}
                          </Typography>
                          <Chip
                            label={attribute.required ? 'Zorunlu' : 'İsteğe Bağlı'}
                            size="small"
                            color={attribute.required ? 'error' : 'default'}
                            variant="outlined"
                          />
                          
                          {attribute.options && attribute.options.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Seçenekler:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {attribute.options.slice(0, 3).map((option) => (
                                  <Chip
                                    key={option}
                                    label={option}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                                {attribute.options.length > 3 && (
                                  <Chip
                                    label={`+${attribute.options.length - 3} daha`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}; 