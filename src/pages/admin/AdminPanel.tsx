import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">
      <h1>Панель администратора</h1>
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Всего пользователей</h3>
          <p className="stat-number">245</p>
        </div>
        <div className="stat-card">
          <h3>Активные турниры</h3>
          <p className="stat-number">12</p>
        </div>
        <div className="stat-card">
          <h3>Завершенные турниры</h3>
          <p className="stat-number">28</p>
        </div>
        <div className="stat-card">
          <h3>Новые регистрации</h3>
          <p className="stat-number">18</p>
        </div>
      </div>
      <div className="quick-actions">
        <Link to="/admin/tournaments/create" className="action-button">Создать турнир</Link>
        <Link to="/admin/users" className="action-button">Управление пользователями</Link>
        <Link to="/admin/registrations" className="action-button">Заявки на регистрацию</Link>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  return (
    <div className="admin-section">
      <h1>Управление пользователями</h1>
      <p>Интерфейс управления пользователями находится в разработке.</p>
      <Link to="/admin" className="back-link">← Вернуться в панель управления</Link>
    </div>
  );
};

const RegistrationManagement: React.FC = () => {
  return (
    <div className="admin-section">
      <h1>Управление заявками</h1>
      <p>Интерфейс управления заявками на регистрацию в турнирах находится в разработке.</p>
      <Link to="/admin" className="back-link">← Вернуться в панель управления</Link>
    </div>
  );
};

// Временный компонент вместо CreateTournament
const TournamentCreationPlaceholder: React.FC = () => {
  return (
    <div className="admin-section">
      <h1>Создание турнира</h1>
      <p>Функционал создания турниров временно отключен.</p>
      <Link to="/admin" className="back-link">← Вернуться в панель управления</Link>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>FIBA 3x3</h2>
          <p>Панель управления</p>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className="nav-item">Главная</Link>
          <Link to="/admin/tournaments/create" className="nav-item">Создать турнир</Link>
          <Link to="/admin/users" className="nav-item">Пользователи</Link>
          <Link to="/admin/registrations" className="nav-item">Заявки</Link>
          <Link to="/" className="nav-item">Вернуться на сайт</Link>
        </nav>
      </div>
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/tournaments/create" element={<TournamentCreationPlaceholder />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/registrations" element={<RegistrationManagement />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel; 