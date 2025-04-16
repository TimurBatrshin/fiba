import React, { useState, useEffect } from 'react';
import './TournamentBracket.css';
import { faBasketball, faTrophy, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Типы для турнирной сетки
interface Team {
  id: string;
  name: string;
  score?: number;
  imageUrl?: string;
}

interface Match {
  id: string;
  team1: Team;
  team2: Team;
  winner?: string; // ID победителя
  matchTime?: string; // Время матча
  courtNumber?: number; // Номер площадки
  isCompleted: boolean;
  round: number;
  matchNumber: number;
}

interface BracketProps {
  tournamentId: string;
  matches: Match[];
  maxRounds?: number;
  isAdmin?: boolean;
  onUpdateMatch?: (matchId: string, team1Score: number, team2Score: number) => void;
}

const TournamentBracket: React.FC<BracketProps> = ({ 
  tournamentId, 
  matches, 
  maxRounds = 3, 
  isAdmin = false,
  onUpdateMatch 
}) => {
  const [roundsExpanded, setRoundsExpanded] = useState<boolean[]>(Array(maxRounds).fill(true));
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [scores, setScores] = useState<{ [key: string]: { team1: number, team2: number } }>({});

  useEffect(() => {
    // Инициализируем состояние счета для каждого матча
    const initialScores: { [key: string]: { team1: number, team2: number } } = {};
    matches.forEach(match => {
      initialScores[match.id] = {
        team1: match.team1.score || 0,
        team2: match.team2.score || 0
      };
    });
    setScores(initialScores);
  }, [matches]);

  const toggleRound = (roundIndex: number) => {
    const newExpanded = [...roundsExpanded];
    newExpanded[roundIndex] = !newExpanded[roundIndex];
    setRoundsExpanded(newExpanded);
  };

  const handleScoreChange = (matchId: string, team: 'team1' | 'team2', value: string) => {
    const numValue = parseInt(value) || 0;
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: numValue
      }
    }));
  };

  const handleSaveScore = (matchId: string) => {
    if (onUpdateMatch) {
      const matchScores = scores[matchId];
      onUpdateMatch(matchId, matchScores.team1, matchScores.team2);
    }
    setEditingMatch(null);
  };

  // Фильтруем матчи по раундам
  const matchesByRound = Array.from({ length: maxRounds }, (_, i) => 
    matches.filter(match => match.round === i + 1)
  );

  // Рассчитываем стили для различных раундов
  const getBracketRoundClasses = (roundIndex: number) => {
    if (roundIndex === maxRounds - 1) return "bracket-round final-round";
    if (roundIndex === maxRounds - 2) return "bracket-round semifinal-round";
    return "bracket-round";
  };
  
  // Определяем названия раундов
  const getRoundName = (roundIndex: number, totalRounds: number) => {
    if (roundIndex === totalRounds - 1) return "Финал";
    if (roundIndex === totalRounds - 2) return "Полуфинал";
    if (roundIndex === totalRounds - 3) return "Четвертьфинал";
    return `Раунд ${roundIndex + 1}`;
  };

  return (
    <div className="tournament-bracket">
      <h2 className="bracket-title">
        <FontAwesomeIcon icon={faTrophy} /> Турнирная сетка
      </h2>
      
      <div className="bracket-container">
        {matchesByRound.map((roundMatches, roundIndex) => (
          <div key={`round-${roundIndex}`} className={getBracketRoundClasses(roundIndex)}>
            <div 
              className="round-header" 
              onClick={() => toggleRound(roundIndex)}
            >
              <h3>{getRoundName(roundIndex, maxRounds)}</h3>
              <button className="toggle-round-btn">
                <FontAwesomeIcon 
                  icon={roundsExpanded[roundIndex] ? faChevronUp : faChevronDown} 
                />
              </button>
            </div>
            
            {roundsExpanded[roundIndex] && (
              <div className="round-matches">
                {roundMatches.length > 0 ? (
                  roundMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className={`match-card ${match.isCompleted ? 'completed' : ''}`}
                    >
                      <div className="match-header">
                        <span className="match-number">Матч #{match.matchNumber}</span>
                        {match.matchTime && (
                          <span className="match-time">{new Date(match.matchTime).toLocaleDateString('ru-RU')}</span>
                        )}
                        {match.courtNumber && (
                          <span className="court-number">Площадка {match.courtNumber}</span>
                        )}
                      </div>
                      
                      <div className="match-teams">
                        <div className={`team ${match.winner === match.team1.id ? 'winner' : ''}`}>
                          <div className="team-info">
                            <div className="team-name">{match.team1.name}</div>
                          </div>
                          <div className="team-score">
                            {editingMatch === match.id && isAdmin ? (
                              <input 
                                type="number" 
                                min="0"
                                value={scores[match.id]?.team1 || 0}
                                onChange={(e) => handleScoreChange(match.id, 'team1', e.target.value)}
                                className="score-input"
                              />
                            ) : (
                              <span>{match.team1.score || 0}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="match-vs">
                          <FontAwesomeIcon icon={faBasketball} />
                        </div>
                        
                        <div className={`team ${match.winner === match.team2.id ? 'winner' : ''}`}>
                          <div className="team-info">
                            <div className="team-name">{match.team2.name}</div>
                          </div>
                          <div className="team-score">
                            {editingMatch === match.id && isAdmin ? (
                              <input 
                                type="number" 
                                min="0"
                                value={scores[match.id]?.team2 || 0}
                                onChange={(e) => handleScoreChange(match.id, 'team2', e.target.value)}
                                className="score-input"
                              />
                            ) : (
                              <span>{match.team2.score || 0}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="match-actions">
                          {editingMatch === match.id ? (
                            <button 
                              className="save-score-btn"
                              onClick={() => handleSaveScore(match.id)}
                            >
                              Сохранить результат
                            </button>
                          ) : (
                            <button 
                              className="edit-score-btn"
                              onClick={() => setEditingMatch(match.id)}
                            >
                              {match.isCompleted ? 'Изменить результат' : 'Внести результат'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-matches">Нет матчей в этом раунде</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;
