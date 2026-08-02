/**
 * Converts Google Drive shareable links, base64 data URLs, and standard image URLs
 * into direct displayable image source URLs for <img> elements.
 */
export function getDirectImageUrl(url?: string | null): string {
  const defaultPlaceholder = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80';

  if (!url || !url.trim()) {
    return defaultPlaceholder;
  }

  const cleanUrl = url.trim();

  // Return base64 or blob URLs directly
  if (cleanUrl.startsWith('data:image/') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // Google Drive link conversion to direct CDN preview image source
  if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com')) {
    let fileId = '';

    // Pattern 1: /file/d/FILE_ID/view or /file/d/FILE_ID/
    const matchD = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) {
      fileId = matchD[1];
    }

    // Pattern 2: id=FILE_ID
    if (!fileId) {
      const matchId = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) {
        fileId = matchId[1];
      }
    }

    // Pattern 3: /d/FILE_ID
    if (!fileId) {
      const matchSlash = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (matchSlash && matchSlash[1]) {
        fileId = matchSlash[1];
      }
    }

    if (fileId && !fileId.startsWith('11lZVmWvxVDBZDMUnS8q9mhyruGGhbX-g_')) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  return cleanUrl;
}
