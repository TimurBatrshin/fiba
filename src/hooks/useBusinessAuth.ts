import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '../config/envConfig';

export const useBusinessAuth = () => {
  const [isBusinessAuthenticated, setIsBusinessAuthenticated] = useState(false);

  useEffect(() => {
    const checkBusinessAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsBusinessAuthenticated(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/auth/business-check`, {
          headers: { Authorization: token },
        });

        setIsBusinessAuthenticated(response.status === 200);
      } catch (error) {
        setIsBusinessAuthenticated(false);
      }
    };

    checkBusinessAuth();
  }, []);

  return { isBusinessAuthenticated };
};