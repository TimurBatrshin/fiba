import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

interface ProfileAvatarProps {
  userId: number;
  className?: string;
  avatarUrl?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ userId, className, avatarUrl }) => {
  const [internalAvatarUrl, setInternalAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (avatarUrl) {
      setInternalAvatarUrl(avatarUrl);
      setLoading(false);
      return;
    }
    const fetchAvatar = async () => {
      try {
        const response = await axios.get(`https://timurbatrshin-fiba-backend-5ef6.twc1.net/api/files/user/${userId}/avatar`);
        if (response.data.avatar_url) {
          // Handle the specific avatar path structure
          const url = response.data.avatar_url.startsWith('http') 
            ? response.data.avatar_url 
            : response.data.avatar_url.startsWith('/opt/build/uploads/avatars/')
              ? response.data.avatar_url.replace('/opt/build/uploads/avatars/', '/uploads/avatars/')
              : `https://timurbatrshin-fiba-backend-5ef6.twc1.net${response.data.avatar_url}`;
          setInternalAvatarUrl(url);
        } else {
          setInternalAvatarUrl(defaultAvatar);
        }
      } catch (err) {
        console.error('Ошибка при загрузке аватарки:', err);
        setInternalAvatarUrl(defaultAvatar);
      } finally {
        setLoading(false);
      }
    };
    fetchAvatar();
  }, [userId, avatarUrl]);

  if (loading) {
    return <div className="avatar-placeholder">Загрузка...</div>;
  }

  return (
    <div className={`profile-avatar ${className || ''}`}>
      <img 
        src={internalAvatarUrl || defaultAvatar} 
        alt="Аватар пользователя" 
        className="avatar-image"
        onError={() => setInternalAvatarUrl(defaultAvatar)}
      />
    </div>
  );
};

export default ProfileAvatar; 