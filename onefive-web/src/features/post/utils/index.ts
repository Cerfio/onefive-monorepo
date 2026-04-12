export const getFileCategory = (
  fileType: string,
): 'image' | 'video' | 'document' => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  return 'document';
};
