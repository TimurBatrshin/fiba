import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./widgets/navbar/navbar";
import Home from "./pages/home/home";
import Tournaments from "./pages/tournaments/tournaments";
import Profile from "./pages/profile/profile";
import Business from "./pages/business/business";
import Tournament from "./pages/tournament/tournament";
import RegisterUser from "./pages/registerUser/registerUser";
import Login from "./pages/login/login";// Импорт компонента панели администратора
import { UserRoleProvider } from "./context/UserRoleContext"; // Импорт провайдера контекста роли пользователя
import Admin from "./pages/admin/admin";
import CreateTournament from "./pages/admin/admin";
import ProposeAd from "./pages/advertiser/ProposeAd";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <UserRoleProvider>
      <Router>
        <div className="app-container">
          <Navbar isAuthenticated={isAuthenticated} />
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile isAuthenticated={isAuthenticated} /> : <Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="/business" element={<Business />} />
            <Route path="/tournament/:id" element={<Tournament />} />
            <Route path="/register-user" element={<RegisterUser />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/create-tournament" element={<CreateTournament />} />
          <Route path="/advertiser/propose-ad" element={<ProposeAd />} />
          </Routes>
        </div>
      </Router>
    </UserRoleProvider>
  );
};

export default App;