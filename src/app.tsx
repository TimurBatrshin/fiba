// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./widgets/navbar/navbar";
import Home from "./pages/home/home";
import Tournaments from "./pages/tournaments/tournaments";
import Profile from "./pages/profile/profile";
import Business from "./pages/business/business";
import Tournament from "./pages/tournament/tournament";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/business" element={<Business />} />
          <Route path="/tournament/:id" element={<Tournament />} /> {/* Новый маршрут для страницы турнира */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
