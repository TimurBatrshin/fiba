import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Tournament = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { currentRole, isAuthenticated } = useAuth();
  const isAdmin = currentRole?.toUpperCase() === 'ADMIN';

  return (
    <div>
      {/* Rest of the component code */}
    </div>
  );
};

export default Tournament; 