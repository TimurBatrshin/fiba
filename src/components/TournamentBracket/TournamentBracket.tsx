import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TournamentBracket.css";

interface Tournament {
  id: number;
  title: string;
  date: string;
  location: string;
  level: string;
  prize_pool: number;
  status: string;
  Registrations: Registration[];
}

interface Registration {
  id: number;
  team_name: string;
  players: string[];
}

const TournamentBracket: React.FC<{ tournamentId: number }> = ({ tournamentId }) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`/api/tournaments/${tournamentId}`);
        setTournament(response.data);
      } catch (err) {
        console.error("Ошибка при получении информации о турнире", err);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  if (!tournament) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="tournament-bracket">
      <h2>{tournament.title}</h2>
      <div className="bracket">
        {tournament.Registrations.map((registration, index) => (
          <div key={registration.id} className="bracket-item">
            <p>{registration.team_name}</p>
            <ul>
              {registration.players.map((player, idx) => (
                <li key={idx}>{player}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;