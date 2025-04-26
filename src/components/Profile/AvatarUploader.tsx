import React, { useState, useRef } from 'react';
import axios from 'axios';

interface AvatarUploaderProps {
  userId: number;
  onUploadSuccess?: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  userId,
  onUploadSuccess,
  onUploadError
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `https://timurbatrshin-fiba-backend-5ef6.twc1.net/api/files/user/${userId}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (onUploadSuccess) {
        onUploadSuccess(response.data.avatar_url);
      }
    } catch (err) {
      const errorMessage = 'Ошибка при загрузке аватарки';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
      console.error('Ошибка при загрузке аватарки:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="upload-button"
      >
        {uploading ? 'Загрузка...' : 'Изменить фото'}
      </button>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AvatarUploader; 