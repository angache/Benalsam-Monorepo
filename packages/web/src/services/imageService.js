import { supabase } from '@/lib/supabaseClient';
export const uploadImages = async (files, userId, bucket) => {
  const uploadPromises = files.map(file => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random()}.${fileExt}`;
    return supabase.storage.from(bucket).upload(fileName, file);
  });

  const results = await Promise.all(uploadPromises);

  const urls = results.map(result => {
    if (result.error) {
      console.error('Image upload error:', result.error);
      throw result.error;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(result.data.path);
    return data.publicUrl;
  });

  return urls;
};

export const deleteImages = async (urls) => {
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
  }).filter(Boolean);

  if (filePaths.length === 0) return;

  const { data, error } = await supabase.storage.from('item_images').remove(filePaths);

  if (error) {
    console.error('Error deleting images:', error);
  }

  return data;
};

export const processImagesForSupabase = async (
  images, 
  mainImageIndex, 
  bucket, 
  context_unused, 
  userId, 
  category_unused, 
  onProgress_unused, 
  initialImageUrls = []
) => {
  const filesToUpload = images.filter(img => img.file && !img.isUploaded).map(img => img.file);
  const keptImageUrls = images.filter(img => img.isUploaded).map(img => img.preview);
  const urlsToDelete = initialImageUrls.filter(url => !keptImageUrls.includes(url));

  if (urlsToDelete.length > 0) {
    await deleteImages(urlsToDelete);
  }

  let newImageUrls = [];
  if (filesToUpload.length > 0) {
    newImageUrls = await uploadImages(filesToUpload, userId, bucket);
  }

  const allImageUrls = [...keptImageUrls, ...newImageUrls];
  
  let finalOrderedUrls = [...allImageUrls];
  if (mainImageIndex >= 0 && mainImageIndex < allImageUrls.length) {
    const mainImage = finalOrderedUrls.splice(mainImageIndex, 1)[0];
    finalOrderedUrls.unshift(mainImage);
  }

  return {
    mainImageUrl: finalOrderedUrls[0] || null,
    additionalImageUrls: finalOrderedUrls.slice(1)
  };
};