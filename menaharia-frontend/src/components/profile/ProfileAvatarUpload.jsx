import { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import ProfileAvatar from './ProfileAvatar';
import { storageApi } from '../../api/storage.api';
import { extractErrorMessage } from '../../lib/api';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

/**
 * Pick → upload to /v1/storage/images → call onUploaded with Cloudinary URL.
 */
export default function ProfileAvatarUpload({
    value,
    name = '',
    folder = 'profiles',
    size = 'lg',
    uploadLabel = 'Change Photo',
    removeLabel = 'Remove',
    disabled = false,
    disabledReason,
    onUploaded,
    onRemoved,
    className,
}) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handlePick = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || disabled) return;

        setError('');
        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        if (file.size > MAX_BYTES) {
            setError('Image must be 5 MB or smaller.');
            return;
        }

        setUploading(true);
        try {
            const result = await storageApi.uploadImage(file, folder);
            const url = result?.secureUrl ?? result?.url ?? null;
            if (!url) throw new Error('Upload succeeded but no image URL was returned.');
            await onUploaded?.({ url, publicId: result?.publicId ?? null, file });
            setError('');
        } catch (err) {
            setError(extractErrorMessage(err, 'Image upload failed.'));
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (disabled || !value) return;
        setError('');
        try {
            await onRemoved?.();
        } catch (err) {
            setError(extractErrorMessage(err, 'Could not remove photo.'));
        }
    };

    return (
        <div className={className}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <ProfileAvatar src={value} name={name} size={size} className="border-4 border-white shadow-sm" />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handlePick}
                            disabled={uploading}
                            className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold disabled:cursor-wait"
                        >
                            {uploading ? 'Uploading…' : uploadLabel}
                        </button>
                    )}
                </div>

                {!disabled && (
                    <div className="flex flex-wrap justify-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPT}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={handlePick}
                            disabled={uploading}
                            className="flex items-center gap-2"
                        >
                            <Upload size={16} />
                            {uploading ? 'Uploading…' : uploadLabel}
                        </Button>
                        {value && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemove}
                                disabled={uploading}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                            >
                                {removeLabel}
                            </Button>
                        )}
                    </div>
                )}

                {disabled && disabledReason && (
                    <p className="text-xs text-gray-500 text-center max-w-xs">{disabledReason}</p>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}
            </div>
        </div>
    );
}
