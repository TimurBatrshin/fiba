import React from 'react';
import defaultAvatar from '../assets/default-avatar.png';

interface ProfilePhotoProps {
  photoUrl?: string;
  className?: string;
}

export const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ photoUrl, className }) => {
  return (
    <div className={`profile-photo-container ${className || ''}`}>
      <img
        src={photoUrl || defaultAvatar}
        alt="Profile"
        className="profile-image"
      />
    </div>
  );
};

export default ProfilePhoto; 