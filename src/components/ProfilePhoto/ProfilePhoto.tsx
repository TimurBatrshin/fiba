import React from 'react';
import './ProfilePhoto.css';

interface ProfilePhotoProps {
  photoUrl?: string;
  className?: string;
}

export const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ 
  photoUrl,
  className = '' 
}) => {
  if (!photoUrl) {
    return null;
  }

  return (
    <div className={`profile-photo ${className}`}>
      <img
        src={photoUrl}
        alt="Profile"
        className="profile-image"
      />
    </div>
  );
}; 