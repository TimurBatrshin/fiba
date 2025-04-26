import React, { useEffect, useState } from 'react';
import { checkApiAvailability, getApiStatus } from '../config/apiConfig';
import styled from 'styled-components';

const ApiStatusContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 999;
  font-size: 12px;
`;

const StatusIndicator = styled.div<{ isActive: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
  background-color: ${props => props.isActive ? '#4caf50' : '#f44336'};
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  color: #666;
  font-size: 11px;
`;

const ApiStatusIndicator: React.FC = () => {
  const [apiStatus, setApiStatus] = useState(getApiStatus());
  const [lastChecked, setLastChecked] = useState<string>('');

  useEffect(() => {
    // Проверка статуса API при монтировании компонента
    checkApiStatus();
  }, []);

  useEffect(() => {
    // Форматирование времени последней проверки
    if (apiStatus.checkedAt) {
      const date = new Date(apiStatus.checkedAt);
      setLastChecked(
        `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`
      );
    }
  }, [apiStatus.checkedAt]);

  const checkApiStatus = async () => {
    const isAvailable = await checkApiAvailability();
    setApiStatus(getApiStatus());
    return isAvailable;
  };

  const refreshApiStatus = async () => {
    await checkApiStatus();
  };

  return (
    <ApiStatusContainer>
      <div>
        <StatusIndicator isActive={apiStatus.available} />
        <strong>API: </strong>
        {apiStatus.available ? 'Доступен' : 'Недоступен'}
      </div>
      
      <StatsRow>
        <span>Проверено: {lastChecked}</span>
        <span 
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={refreshApiStatus}
        >
          Обновить
        </span>
      </StatsRow>
      
      {apiStatus.error && <div style={{ color: 'red', fontSize: '11px', marginTop: '3px' }}>{apiStatus.error}</div>}
    </ApiStatusContainer>
  );
};

export default ApiStatusIndicator; 