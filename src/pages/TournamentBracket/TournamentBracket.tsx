import React from 'react';

const TournamentBracket = ({ registrations }) => {
  const renderBracket = (teams) => {
    if (teams.length <= 1) {
      return teams.map((team, index) => (
        <div key={index} className="bracket-item">
          <p>{team.team_name}</p> {/* Пример отображения команды */}
        </div>
      ));
    }

    const mid = Math.ceil(teams.length / 2);
    const leftSide = teams.slice(0, mid);
    const rightSide = teams.slice(mid);

    return (
      <div className="bracket-match">
        <div className="left-side">{renderBracket(leftSide)}</div>
        <div className="right-side">{renderBracket(rightSide)}</div>
      </div>
    );
  };

  return (
    <div className="tournament-bracket">
      <h2>Турнирная сетка</h2>
      <div className="bracket">{renderBracket(registrations)}</div>
    </div>
  );
};

export default TournamentBracket;
