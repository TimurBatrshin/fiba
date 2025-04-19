import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/envConfig";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/auth/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsAuthenticated(response.status === 200);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated };
};