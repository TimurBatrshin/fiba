import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./UserCalendar.css"; 

const localizer = momentLocalizer(moment);

interface TournamentEvent extends Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  location: string;
  level: string;
}

const UserCalendar = ({ userId }: { userId: string }) => {
  const [events, setEvents] = useState<TournamentEvent[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/tournaments/user/${userId}/registrations`);
        
        const data = response.data.map((tournament: any) => ({
          id: tournament.id,
          title: tournament.name,
          start: new Date(tournament.date),
          end: new Date(tournament.date),
          location: tournament.location,
          level: tournament.level,
        }));

        setEvents(data);
      } catch (error) {
        console.error("Ошибка при загрузке турниров:", error);
      }
    };

    fetchTournaments();
  }, [userId]);

  const handleSelectEvent = (event: TournamentEvent) => {
    window.location.href = `/tournaments/${event.id}`;  // Переход на страницу турнира
  };

  return (
    <div className="calendar-container">
      <h2>Мой календарь турниров</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleSelectEvent}
      />
    </div>
  );
};

export default UserCalendar;
