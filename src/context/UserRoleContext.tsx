import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Создайте контекст
export const UserRoleContext = createContext<{ role: string }>({ role: "user" });

interface UserRoleProviderProps {
  children: ReactNode;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({ children }) => {
  const [role, setRole] = useState("user");

  useEffect(() => {
    // Получите роль пользователя из API или другого источника
    const fetchUserRole = async () => {
      // Пример запроса к API для получения роли пользователя
      const response = await axios.get("http://localhost:8080/api/user/role");
      const data = await response.data;
      setRole(data.role);
    };

    fetchUserRole();
  }, []);

  return (
    <UserRoleContext.Provider value={{ role }}>
      {children}
    </UserRoleContext.Provider>
  );
};