import ImageKit from 'imagekit';
import config from '../config/config.js';


const imagekit = new ImageKit({
  publicKey: config.imagekitPublic,
  privateKey: config.imagekitPrivate,
  urlEndpoint: config.imagekitEndpoint,
});

export default imagekit;


export const deleteMedia = async (fileId) => {
  if (!fileId) return;

  try {
    await imagekit.deleteFile(fileId);
    console.log(`Media with fileId ${fileId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting media with fileId ${fileId}:`, error.message);
  }
};