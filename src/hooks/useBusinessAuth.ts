import { useState, useEffect } from "react";
import axios from "axios";

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

        const response = await axios.get('/api/auth/business-check', {
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