import React, { useState, useEffect } from 'react';
import { getStoredToken } from '../../utils/tokenStorage';
import './UserPhoto.css';

const API_BASE_URL = 'https://timurbatrshin-fiba-backend-5ef6.twc1.net';

interface UserPhotoProps {
  photoUrl?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const UserPhoto: React.FC<UserPhotoProps> = ({ 
  photoUrl,
  size = 'medium',
  className = '' 
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!photoUrl) {
        setError(true);
        return;
      }

      try {
        const token = getStoredToken();
        if (!token) {
          setError(true);
          return;
        }

        // If it's already a complete URL, use it directly
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
          setImageUrl(photoUrl);
          return;
        }

        // Remove leading slash if present
        const cleanUrl = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl;
        
        const response = await fetch(`${API_BASE_URL}/${cleanUrl}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setError(false);
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
      }
    };

    loadImage();

    // Cleanup function to revoke object URL
    return () => {
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [photoUrl]);

  // Return a default avatar or placeholder when there's an error or no image
  if (error || !imageUrl) {
    return (
      <div className={`user-photo ${size} ${className}`}>
        <div className="user-photo-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor" className="placeholder-icon">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`user-photo ${size} ${className}`}>
      <img
        src={imageUrl}
        alt="User"
        className="user-image"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default UserPhoto; 