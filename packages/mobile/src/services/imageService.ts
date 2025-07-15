import { supabase } from './supabaseClient';

export const uploadImages = async (files: any[], userId: string, bucket: string) => {
  const uploadPromises = files.map(async (file, index) => {
    // React Native için dosya formatını düzelt
    const fileExt = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${Date.now()}-${Math.random()}.${fileExt}`;
    
    // MIME type'ı dosya uzantısından belirle
    let mimeType = 'image/jpeg'; // default
    if (fileExt === 'png') mimeType = 'image/png';
    else if (fileExt === 'gif') mimeType = 'image/gif';
    else if (fileExt === 'webp') mimeType = 'image/webp';
    
    // React Native için uygun file objesi oluştur
    let fileToUpload;
    
    if (file.uri && file.uri.startsWith('file://')) {
      // Local file (galeri seçimi) - FormData yaklaşımı
      try {
        // React Native için FormData kullan - en güvenilir yöntem
        fileToUpload = {
          uri: file.uri,
          name: file.name,
          type: mimeType,
        } as any;
      } catch (error) {
        console.error(`❌ Error processing local file ${index + 1}:`, error);
        throw error;
      }
    } else {
      // Bu büyük ihtimalle önceden yüklenmiş dosya, doğrudan kullan
      fileToUpload = file;
    }

    try {
      // Supabase'e upload - contentType'ı manuel belirt
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
          contentType: mimeType  // MIME type'ı manuel belirt
        });

      if (error) {
        console.error(`❌ Image upload error for file ${index + 1}:`, error);
        console.error('❌ Error details:', {
          message: error.message
        });
        throw error;
      }

      // Public URL oluştur
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const publicUrl = publicData.publicUrl;

      return { fileName, url: publicUrl };
    } catch (error) {
      console.error(`❌ Upload failed for file ${index + 1}:`, error);
      throw error;
    }
  });
  
  try {
    const results = await Promise.all(uploadPromises);
    const uploadedUrls = results.map(result => result.url);
    return uploadedUrls;
  } catch (error) {
    console.error('❌ Error in uploadImages:', error);
    throw error;
  }
};

export const deleteImages = async (urls: string[]) => {
  if (!urls || urls.length === 0) return;

  const filePaths = urls.map(url => {
    try {
      const urlObject = new URL(url);
      const pathParts = urlObject.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === 'item_images' || part === 'avatars');
      if (bucketIndex === -1) return null;
      return pathParts.slice(bucketIndex + 1).join('/');
    } catch (e) {
      console.error('Invalid URL for deletion:', url);
      return null;
    }
  }).filter(Boolean) as string[];

  if (filePaths.length === 0) return;

  const { data, error } = await supabase.storage.from('item_images').remove(filePaths);

  if (error) {
    console.error('Error deleting images:', error);
  }

  return data;
};

export const processImagesForSupabase = async (
  images: any[], 
  mainImageIndex: number, 
  bucket: string, 
  context_unused: string, 
  userId: string, 
  category_unused: string, 
  onProgress_unused?: (progress: number) => void, 
  initialImageUrls: string[] = []
) => {
  // Sadece yeni görselleri yükle (isUploaded: false olanlar)
  const filesToUpload = images.filter(img => img.file && !img.isUploaded).map(img => img.file);
  const urlsToDelete = initialImageUrls.length > 0 ? initialImageUrls : [];
  
  // Yeni görselleri yükle
  let uploadedImageUrls: string[] = [];
  if (filesToUpload.length > 0) {
    uploadedImageUrls = await uploadImages(filesToUpload, userId, bucket);
  }
  
  // URL'leri orijinal sıraya göre düzenle
  const finalImageUrls: string[] = [];
  let uploadedIndex = 0;
  
  images.forEach((img, index) => {
    if (img.isStockImage && img.uri) {
      // Stok görsel - URL zaten mevcut
      finalImageUrls[index] = img.uri;
    } else if (img.file && !img.isUploaded) {
      // Yeni yüklenen görsel
      finalImageUrls[index] = uploadedImageUrls[uploadedIndex];
      uploadedIndex++;
    } else {
      // Mevcut görsel veya başka durum
      finalImageUrls[index] = img.uri || img.url || '';
    }
  });
  
  // Ana görseli başa al
  const orderedUrls = [...finalImageUrls];
  if (mainImageIndex > 0 && orderedUrls[mainImageIndex]) {
    const mainImage = orderedUrls[mainImageIndex];
    orderedUrls.splice(mainImageIndex, 1);
    orderedUrls.unshift(mainImage);
  }
  
  return {
    mainImageUrl: orderedUrls[0] || '',
    additionalImageUrls: orderedUrls.slice(1),
    urlsToDelete
  };
}; 