import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CreateTournament from './CreateTournament';

const Admin: React.FC = () => {
  return (
    <div>
      <h1>Admin Panel</h1>
      <nav>
        <ul>
          <li><Link to="create-tournament">Create Tournament</Link></li>
          {/* Добавьте остальные ссылки админ-панели здесь */}
        </ul>
      </nav>
      <Routes>
        <Route path="create-tournament" element={<CreateTournament />} />
        {/* Добавьте остальные маршруты админ-панели здесь */}
      </Routes>
    </div>
  );
};

export default Admin;