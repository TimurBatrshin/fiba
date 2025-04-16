import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  IconDefinition, 
  faArrowUp, 
  faArrowDown 
} from '@fortawesome/free-solid-svg-icons';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: IconDefinition;
  change?: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  compareText?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  suffix = '',
  prefix = '',
  color,
  compareText
}) => {
  // Определяем класс для значения изменения (положительное или отрицательное)
  const getChangeClass = () => {
    if (!change) return '';
    return change > 0 ? 'stat-increase' : 'stat-decrease';
  };

  // Получаем иконку стрелки в зависимости от направления изменения
  const getChangeIcon = () => {
    if (!change) return null;
    return change > 0 ? faArrowUp : faArrowDown;
  };

  // Форматируем значение изменения для отображения
  const formatChange = () => {
    if (change === undefined) return null;
    const absChange = Math.abs(change);
    return `${change > 0 ? '+' : ''}${absChange}${suffix}`;
  };

  return (
    <div className="stat-card" style={{ borderTop: color ? `3px solid ${color}` : undefined }}>
      <div className="stat-card-header">
        <div className="stat-card-title">{title}</div>
        {icon && <FontAwesomeIcon icon={icon} className="stat-card-icon" />}
      </div>
      <div className="stat-card-value">
        {prefix}{value}{suffix}
      </div>
      {(change !== undefined || compareText) && (
        <div className={`stat-card-small ${getChangeClass()}`}>
          {change !== undefined && (
            <>
              <FontAwesomeIcon icon={getChangeIcon() as IconDefinition} /> {formatChange()}
            </>
          )}
          {compareText && <span> {compareText}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard; 