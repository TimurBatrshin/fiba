import React from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./UserCalendar.css"; 

const localizer = momentLocalizer(moment);

interface TournamentEvent extends Event {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  level?: string;
  resource?: any;
}

interface UserCalendarProps {
  userId?: string;
  events?: TournamentEvent[];
}

const UserCalendar: React.FC<UserCalendarProps> = ({ userId, events = [] }) => {
  const handleSelectEvent = (event: TournamentEvent) => {
    if (event.id) {
      window.location.href = `/tournaments/${event.id}`;  // Переход на страницу турнира
    }
  };

  return (
    <div className="calendar-container">
      <h2>Календарь турниров</h2>
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
