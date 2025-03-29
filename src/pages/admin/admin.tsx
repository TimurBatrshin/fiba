import React, { useState, useEffect } from "react";
import axios from "axios";
import "./admin.css";

const Admin = () => {
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    level: "",
    prize_pool: 0,
    status: "registration",
  });
  const [editMode, setEditMode] = useState(false);
  const [currentTournamentId, setCurrentTournamentId] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get("/api/tournaments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTournaments(response.data);
      } catch (err) {
        console.error("Ошибка при получении турниров", err);
      }
    };

    fetchTournaments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Редактирование турнира
        await axios.put(`/api/tournaments/${currentTournamentId}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } else {
        // Создание нового турнира
        await axios.post("/api/tournaments", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }
      setEditMode(false);
      setCurrentTournamentId(null);
      setFormData({
        title: "",
        date: "",
        location: "",
        level: "",
        prize_pool: 0,
        status: "registration",
      });
      const response = await axios.get("/api/tournaments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTournaments(response.data);
    } catch (err) {
      console.error("Ошибка при создании или редактировании турнира", err);
    }
  };

  const handleEdit = (tournament: any) => {
    setEditMode(true);
    setCurrentTournamentId(tournament.id);
    setFormData({
      title: tournament.title,
      date: tournament.date,
      location: tournament.location,
      level: tournament.level,
      prize_pool: tournament.prize_pool,
      status: tournament.status,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/tournaments/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTournaments(tournaments.filter((tournament) => tournament.id !== id));
    } catch (err) {
      console.error("Ошибка при удалении турнира", err);
    }
  };

  return (
    <div className="admin-container">
      <h1>Управление турнирами</h1>
      <form onSubmit={handleCreateOrUpdate} className="admin-form">
        <div>
          <label>Название</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Дата</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Место</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Уровень</label>
          <input
            type="text"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Призовой фонд</label>
          <input
            type="number"
            name="prize_pool"
            value={formData.prize_pool}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Статус</label>
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{editMode ? "Обновить турнир" : "Создать турнир"}</button>
      </form>
      <div className="tournaments-list">
        {tournaments.map((tournament: any) => (
          <div key={tournament.id} className="tournament-item">
            <h3>{tournament.title}</h3>
            <p>Дата: {tournament.date}</p>
            <p>Место: {tournament.location}</p>
            <p>Уровень: {tournament.level}</p>
            <p>Призовой фонд: {tournament.prize_pool}</p>
            <p>Статус: {tournament.status}</p>
            <button onClick={() => handleEdit(tournament)}>Редактировать</button>
            <button onClick={() => handleDelete(tournament.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;