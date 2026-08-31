/**
 * Helper to resolve uploaded file URLs for preview/download
 */
export const resolveFileUrl = (url) => {
  if (!url) return '';
  if (
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase && !import.meta.env.DEV) {
    const rootUrl = apiBase.replace(/\/api\/?$/, '');
    return `${rootUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return url;
};

/**
 * Format bytes to readable size (e.g. 1.2 MB, 350 KB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if URL or filename is an image
 */
export const isImageFile = (urlOrName = '') => {
  if (!urlOrName) return false;
  return /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp)$/i.test(urlOrName.split('?')[0]);
};

/**
 * Check if URL or filename is a PDF
 */
export const isPdfFile = (urlOrName = '') => {
  if (!urlOrName) return false;
  return /\.pdf$/i.test(urlOrName.split('?')[0]);
};
