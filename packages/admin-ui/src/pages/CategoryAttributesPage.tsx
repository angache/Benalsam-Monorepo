import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowLeft,
  Edit,
  Delete,
  Plus,
  Save,
  X,
  Settings,
  Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService, type Category, type CategoryAttribute } from '../services/categoryService';

interface AttributeFormData {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  options: string[];
}

export const CategoryAttributesPage: React.FC = () => {
  const { path } = useParams<{ path: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<CategoryAttribute | null>(null);
  const [formData, setFormData] = useState<AttributeFormData>({
    key: '',
    label: '',
    type: 'string',
    required: false,
    options: [],
  });

  // Fetch category
  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', path],
    queryFn: () => categoryService.getCategory(path!),
    enabled: !!path,
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Category>) => categoryService.updateCategory(path!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category', path] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      setEditingAttribute(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      key: '',
      label: '',
      type: 'string',
      required: false,
      options: [],
    });
  };

  const handleAddAttribute = () => {
    setEditingAttribute(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditAttribute = (attribute: CategoryAttribute) => {
    setEditingAttribute(attribute);
    setFormData({
      key: attribute.key,
      label: attribute.label,
      type: attribute.type,
      required: attribute.required,
      options: attribute.options || [],
    });
    setIsDialogOpen(true);
  };

  const handleDeleteAttribute = (attributeKey: string) => {
    if (!category) return;

    const updatedAttributes = category.attributes?.filter(attr => attr.key !== attributeKey) || [];
    
    updateMutation.mutate({
      ...category,
      attributes: updatedAttributes,
    });
  };

  const handleSaveAttribute = () => {
    if (!category || !formData.key || !formData.label) return;

    const newAttribute: CategoryAttribute = {
      key: formData.key,
      label: formData.label,
      type: formData.type,
      required: formData.required,
      options: formData.type === 'array' ? formData.options : undefined,
    };

    let updatedAttributes: CategoryAttribute[];

    if (editingAttribute) {
      // Update existing attribute
      updatedAttributes = category.attributes?.map(attr =>
        attr.key === editingAttribute.key ? newAttribute : attr
      ) || [];
    } else {
      // Add new attribute
      updatedAttributes = [...(category.attributes || []), newAttribute];
    }

    updateMutation.mutate({
      ...category,
      attributes: updatedAttributes,
    });
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option),
    }));
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
  if (hasSubcategories) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Bu kategori alt kategorilere sahip. Özellikler sadece son kategorilerde (alt kategorisi olmayan) düzenlenebilir.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(`/categories/${encodeURIComponent(path!)}`)}>
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="h4" component="h1">
            {category.name} - Özellikler
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={handleAddAttribute}
        >
          Yeni Özellik Ekle
        </Button>
      </Box>

      {/* Attributes List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Kategori Özellikleri ({category.attributes?.length || 0})
          </Typography>
          
          {!category.attributes || category.attributes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>
                Bu kategoride henüz özellik tanımlanmamış.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Plus />}
                onClick={handleAddAttribute}
              >
                İlk Özelliği Ekle
              </Button>
            </Box>
          ) : (
            <List>
              {category.attributes.map((attribute, index) => (
                <React.Fragment key={attribute.key}>
                  <ListItem
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {attribute.label}
                          </Typography>
                          <Chip
                            label={attribute.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {attribute.required && (
                            <Chip
                              label="Zorunlu"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Anahtar: {attribute.key}
                          </Typography>
                          {attribute.options && attribute.options.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Seçenekler: {attribute.options.join(', ')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleEditAttribute(attribute)}
                          >
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAttribute(attribute.key)}
                            disabled={updateMutation.isPending}
                          >
                            <Delete size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < category.attributes!.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Attribute Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingAttribute ? 'Özellik Düzenle' : 'Yeni Özellik Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Özellik Anahtarı"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                placeholder="ornek_anahtar"
                helperText="Benzersiz bir anahtar (snake_case)"
                disabled={!!editingAttribute} // Key cannot be changed when editing
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Özellik Adı"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Özellik Adı"
                helperText="Kullanıcıya gösterilecek ad"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Veri Tipi</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  label="Veri Tipi"
                >
                  <MenuItem value="string">Metin (String)</MenuItem>
                  <MenuItem value="number">Sayı (Number)</MenuItem>
                  <MenuItem value="boolean">Evet/Hayır (Boolean)</MenuItem>
                  <MenuItem value="array">Seçenek Listesi (Array)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.required}
                    onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                  />
                }
                label="Zorunlu Alan"
              />
            </Grid>
            
            {formData.type === 'array' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Seçenekler
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {formData.options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Seçenek ${index + 1}`}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<Plus />}
                    onClick={handleAddOption}
                    size="small"
                  >
                    Seçenek Ekle
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDialogOpen(false)}
            startIcon={<X />}
          >
            İptal
          </Button>
          <Button
            onClick={handleSaveAttribute}
            variant="contained"
            startIcon={<Save />}
            disabled={!formData.key || !formData.label || updateMutation.isPending}
          >
            {editingAttribute ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 