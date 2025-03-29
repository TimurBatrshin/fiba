import './admin.css';
import React, { useContext, useState } from "react";
import { UserRoleContext } from '../../context/UserRoleContext'; // Контекст для проверки роли
import axios from 'axios';

const Admin: React.FC = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [prizePool, setPrizePool] = useState(0);
  const [rules, setRules] = useState('');
  const { role, loading } = useContext(UserRoleContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tournamentData = {
      title: title,
      date: date,
      location: location,
      level: level,
      prize_pool: prizePool,
      rules: rules,
    };

    try {
      const response = await axios.post('http://localhost:8080/api/tournaments', tournamentData);
      console.log(response.data);
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Create Tournament</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label>Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <div>
          <label>Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} required>
            <option value="">Select level</option>
            <option value="amateur">Amateur</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <div>
          <label>Prize Pool</label>
          <input type="number" value={prizePool} onChange={(e) => setPrizePool(Number(e.target.value))} required />
        </div>
        <div>
          <label>Rules</label>
          <textarea value={rules} onChange={(e) => setRules(e.target.value)} required />
        </div>
        <button type="submit">Create Tournament</button>
      </form>
    </div>
  );
};

export default Admin;
