/**
 * Service to handle client-side direct uploads to Cloudinary
 * using the provided cloud name & unsigned upload preset fields.
 */

const CLOUDINARY_CLOUD_NAME = 'dfglfe0uy';
const CLOUDINARY_UPLOAD_PRESET = 'Muro_Suelo_Urbano';

/**
 * Uploads a base64 string or a File object directly to Cloudinary.
 * Supports image and video.
 */
export async function uploadToCloudinary(fileOrBase64: File | string): Promise<string> {
  const formData = new FormData();
  
  if (typeof fileOrBase64 === 'string') {
    // If it is a base64 data URL, Cloudinary accepts it directly!
    formData.append('file', fileOrBase64);
  } else {
    // Standard File object
    formData.append('file', fileOrBase64);
  }
  
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  // Auto-detect if it's a video or image to post to the correct Cloudinary resource endpoint
  let resourceType = 'image';
  if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:video/')) {
    resourceType = 'video';
  } else if (fileOrBase64 instanceof File && fileOrBase64.type.startsWith('video/')) {
    resourceType = 'video';
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error("No secure_url found in Cloudinary response payload.");
    }

    return data.secure_url; // Returns the high-performance https url
  } catch (error) {
    console.error("Cloudinary upload service exception:", error);
    throw error;
  }
}
