import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Table, Button, Form, Badge } from 'react-bootstrap';
import { 
  getAdminStats, 
  getAdminUsers, 
  updateUserRole, 
  getAdminTournaments, 
  updateTournamentStatus, 
  getAdminAds, 
  deleteAd,
  AdminStats, 
  AdminUser, 
  AdminTournament, 
  AdminAd 
} from '../services/api/admin';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'dashboard') {
        const statsData = await getAdminStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const usersData = await getAdminUsers();
        setUsers(usersData);
      } else if (activeTab === 'tournaments') {
        const tournamentsData = await getAdminTournaments();
        setTournaments(tournamentsData);
      } else if (activeTab === 'ads') {
        const adsData = await getAdminAds();
        setAds(adsData);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role } : user
        )
      );
    } catch (err) {
      setError('Failed to update user role.');
      console.error(err);
    }
  };

  const handleStatusChange = async (tournamentId: string, status: 'registration' | 'in_progress' | 'completed') => {
    try {
      await updateTournamentStatus(tournamentId, status);
      setTournaments(prevTournaments => 
        prevTournaments.map(tournament => 
          tournament.id === tournamentId ? { ...tournament, status } : tournament
        )
      );
    } catch (err) {
      setError('Failed to update tournament status.');
      console.error(err);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      await deleteAd(adId);
      setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
    } catch (err) {
      setError('Failed to delete ad.');
      console.error(err);
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-container">
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h2>{stats.userCount}</h2>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h2>{stats.tournamentCount}</h2>
            <p>Tournaments</p>
          </div>
          <div className="stat-card">
            <h2>{stats.registrationCount}</h2>
            <p>Team Registrations</p>
          </div>
          <div className="stat-card">
            <h2>{stats.adCount}</h2>
            <p>Active Ads</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <Table striped bordered hover>
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
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
              >
                <option value="USER">User</option>
                <option value="BUSINESS">Business</option>
                <option value="ADVERTISER">Advertiser</option>
                <option value="ADMIN">Admin</option>
              </Form.Control>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const renderTournaments = () => (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Location</th>
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
            <td>{tournament.location}</td>
            <td>{new Date(tournament.date).toLocaleDateString()}</td>
            <td>
              <Badge bg={
                tournament.status === 'registration' ? 'primary' :
                tournament.status === 'in_progress' ? 'warning' : 'success'
              }>
                {tournament.status}
              </Badge>
            </td>
            <td>{tournament.registration_count}</td>
            <td>
              <Form.Control
                as="select"
                value={tournament.status}
                onChange={(e) => handleStatusChange(
                  tournament.id, 
                  e.target.value as 'registration' | 'in_progress' | 'completed'
                )}
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

  const renderAds = () => (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Tournament</th>
          <th>Business</th>
          <th>Advertiser</th>
          <th>Views</th>
          <th>Clicks</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {ads.map(ad => (
          <tr key={ad.id}>
            <td>{ad.id}</td>
            <td>{ad.title}</td>
            <td>{ad.tournament_name || 'N/A'}</td>
            <td>{ad.business_name || 'N/A'}</td>
            <td>{ad.advertiser_name || 'N/A'}</td>
            <td>{ad.views}</td>
            <td>{ad.clicks}</td>
            <td>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => handleDeleteAd(ad.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div className="admin-panel-container">
      <h1>Admin Panel</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <Tabs
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
        <Tab eventKey="ads" title="Advertisements">
          {loading ? <p>Loading...</p> : renderAds()}
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminPanel; 