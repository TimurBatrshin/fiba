import React, { useState } from "react";

const AdminTournamentForm = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [prizePool, setPrizePool] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/admin/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date, location, level, prize_pool: prizePool })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Турнир успешно создан!');
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Название турнира</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Дата</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label>Локация</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div>
        <label>Уровень</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="amateur">Любительский</option>
          <option value="professional">Профессиональный</option>
        </select>
      </div>
      <div>
        <label>Призовой фонд</label>
        <input type="text" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} />
      </div>
      <button type="submit">Создать турнир</button>
    </form>
  );
};

export default AdminTournamentForm;
