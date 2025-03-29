import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Создайте контекст
export const UserRoleContext = createContext<{ role: string; loading: boolean }>({
  role: "user",
  loading: true,
});

interface UserRoleProviderProps {
  children: ReactNode;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({ children }) => {
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    // Получите роль пользователя из API или другого источника
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/user/role");
        const data = await response.data;
        setRole(data.role);
        setLoading(false); // Устанавливаем загрузку в false, когда данные получены
      } catch (error) {
        console.error("Ошибка при получении роли пользователя:", error);
        setLoading(false); // Устанавливаем загрузку в false в случае ошибки
      }
    };

    fetchUserRole();
  }, []);

  return (
    <UserRoleContext.Provider value={{ role, loading }}>
      {children}
    </UserRoleContext.Provider>
  );
};
