import { api, unwrapEnvelope } from '../lib/api';

/**
 * Storage API  (auth required)
 *
 * uploadImage — POST   /v1/storage/images  (multipart)
 * deleteImage — DELETE /v1/storage/images?publicId=
 */

/**
 * @param {File} file
 * @param {string} [folder]  Cloudinary folder, e.g. "profiles" | "operators"
 * @returns {Promise<{ secureUrl: string, publicId: string, url?: string }>}
 */
export const uploadImage = async (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const response = await api.post('/storage/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapEnvelope(response);
};

/**
 * @param {string} publicId  Cloudinary public id returned from upload
 */
export const deleteImage = (publicId) =>
    api.delete('/storage/images', { params: { publicId } }).then(unwrapEnvelope);

export const storageApi = { uploadImage, deleteImage };
