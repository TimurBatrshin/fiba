import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./widgets/navbar/navbar";
import Home from "./pages/home/home";
import Tournaments from "./pages/tournaments/tournaments";
import Profile from "./pages/profile/profile";
import Business from "./pages/business/business";
import Tournament from "./pages/tournament/tournament";
import EditProfile from "./pages/profile/editProfile";
import RegisterUser from "./pages/registerUser/registerUser";
import Login from "./pages/login/login";
import Admin from "./pages/admin/admin"; // Импорт компонента панели администратора

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/business" element={<Business />} />
          <Route path="/tournament/:id" element={<Tournament />} /> {/* Новый маршрут */}
          <Route path="/register-user" element={<RegisterUser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;