import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Table, Button, Form, Badge, Alert } from 'react-bootstrap';
import { 
  getAdminStats, 
  getAdminUsers, 
  updateUserRole, 
  getAdminTournaments, 
  updateTournamentStatus,
  AdminStats, 
  AdminUser, 
  AdminTournament
} from '../services/api/admin';
import './AdminPanel.css';
import FeatureFlagsManager from './FeatureFlagsManager';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, usersData, tournamentsData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminTournaments()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setTournaments(tournamentsData as AdminTournament[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      setError(null);
      await updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const handleTournamentStatusChange = async (tournamentId: string, newStatus: 'registration' | 'in_progress' | 'completed') => {
    try {
      setError(null);
      await updateTournamentStatus(tournamentId, newStatus);
      setTournaments(tournaments.map(tournament =>
        tournament.id === tournamentId ? { ...tournament, status: newStatus } : tournament
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tournament status');
    }
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats?.total_users || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Tournaments</h3>
          <p>{stats?.total_tournaments || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active Tournaments</h3>
          <p>{stats?.active_tournaments || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Registrations</h3>
          <p>{stats?.pending_registrations || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <Table striped bordered hover data-testid="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{new Date(user.created_at).toLocaleDateString()}</td>
            <td>
              <Form.Control
                as="select"
                data-testid={`user-role-select-${user.id}`}
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </Form.Control>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const renderTournaments = () => (
    <Table striped bordered hover data-testid="tournaments-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Date</th>
          <th>Status</th>
          <th>Registrations</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tournaments.map(tournament => (
          <tr key={tournament.id}>
            <td>{tournament.id}</td>
            <td>{tournament.title}</td>
            <td>{new Date(tournament.date).toLocaleDateString()}</td>
            <td>
              <Badge bg={
                tournament.status === 'registration' ? 'primary' :
                tournament.status === 'in_progress' ? 'warning' :
                'success'
              }>
                {tournament.status}
              </Badge>
            </td>
            <td>{tournament.registrations_count}</td>
            <td>
              <Form.Control
                as="select"
                data-testid={`tournament-status-select-${tournament.id}`}
                value={tournament.status}
                onChange={(e) => handleTournamentStatusChange(tournament.id, e.target.value as 'registration' | 'in_progress' | 'completed')}
              >
                <option value="registration">Registration</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Control>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div className="admin-panel-container">
      <h1>Admin Panel</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs
        id="admin-tabs"
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key || 'dashboard')}
        className="mb-4"
      >
        <Tab eventKey="dashboard" title="Dashboard">
          {loading ? <p>Loading...</p> : renderDashboard()}
        </Tab>
        <Tab eventKey="users" title="Users">
          {loading ? <p>Loading...</p> : renderUsers()}
        </Tab>
        <Tab eventKey="tournaments" title="Tournaments">
          {loading ? <p>Loading...</p> : renderTournaments()}
        </Tab>
        <Tab eventKey="features" title="Функции">
          <FeatureFlagsManager />
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminPanel; 