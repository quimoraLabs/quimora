import ImageKit from 'imagekit';
import config from '../config/config.js';

const isImageKitConfigured = () => {
  return (
    config.imagekitPublic &&
    config.imagekitPublic !== 'dummy_public_key' &&
    config.imagekitPrivate &&
    config.imagekitPrivate !== 'dummy_private_key' &&
    config.imagekitEndpoint &&
    !config.imagekitEndpoint.includes('dummy')
  );
};

const imagekit = new ImageKit({
  publicKey: config.imagekitPublic || 'dummy_public_key',
  privateKey: config.imagekitPrivate || 'dummy_private_key',
  urlEndpoint: config.imagekitEndpoint || 'https://ik.imagekit.io/dummy',
});

export default imagekit;

/**
 * Uploads media to ImageKit with robust fallback to base64 Data URI if ImageKit fails or is unconfigured.
 */
export const uploadMedia = async ({ fileBuffer, fileName, folder = '/quimora', mimetype = 'image/png' }) => {
  if (isImageKitConfigured()) {
    try {
      const uploadResponse = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: folder,
      });
      return {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
      };
    } catch (err) {
      console.warn(`[IMAGEKIT] Upload failed (${err.message}). Falling back to Data URI storage.`);
    }
  } else {
    console.info('[IMAGEKIT] Unconfigured or dummy credentials. Using inline Data URI fallback.');
  }

  // Fallback: Generate base64 Data URI
  const mime = mimetype || 'image/png';
  const base64Data = fileBuffer.toString('base64');
  const dataUrl = `data:${mime};base64,${base64Data}`;
  return {
    url: dataUrl,
    fileId: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  };
};

export const deleteMedia = async (fileId) => {
  if (!fileId || fileId.startsWith('fallback-') || fileId.startsWith('data:')) return;

  try {
    if (isImageKitConfigured()) {
      await imagekit.deleteFile(fileId);
      console.log(`Media with fileId ${fileId} deleted successfully`);
    }
  } catch (error) {
    console.error(`Error deleting media with fileId ${fileId}:`, error.message);
  }
};