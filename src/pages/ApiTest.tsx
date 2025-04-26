import React, { useState } from 'react';
import { testApiConnection, testAuthentication, testGetTournaments, runAllTests } from '../tests/apiTest';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('Timur007@example.com');
  const [password, setPassword] = useState('qwerty123');

  const handleTestConnection = async () => {
    setLoading(true);
    const res = await testApiConnection();
    setResult(res);
    setLoading(false);
  };

  const handleTestAuth = async () => {
    setLoading(true);
    const res = await testAuthentication(email, password);
    setResult(res);
    setLoading(false);
  };

  const handleTestTournaments = async () => {
    setLoading(true);
    const res = await testGetTournaments();
    setResult(res);
    setLoading(false);
  };

  const handleRunAllTests = async () => {
    setLoading(true);
    await runAllTests();
    setResult({ message: 'Все тесты выполнены, смотрите результаты в консоли' });
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Тестирование API</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Тестовые учетные данные</h5>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Пароль</label>
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      <div className="d-grid gap-2 d-md-block mb-4">
        <button 
          className="btn btn-primary me-2" 
          onClick={handleTestConnection}
          disabled={loading}
        >
          Проверить соединение
        </button>
        <button 
          className="btn btn-success me-2" 
          onClick={handleTestAuth}
          disabled={loading}
        >
          Тест аутентификации
        </button>
        <button 
          className="btn btn-info me-2" 
          onClick={handleTestTournaments}
          disabled={loading}
        >
          Тест получения турниров
        </button>
        <button 
          className="btn btn-warning" 
          onClick={handleRunAllTests}
          disabled={loading}
        >
          Запустить все тесты
        </button>
      </div>
      
      {loading && (
        <div className="alert alert-info">
          Выполнение теста...
        </div>
      )}
      
      {result && (
        <div className="card">
          <div className="card-header">
            Результаты теста
          </div>
          <div className="card-body">
            <pre className="mb-0">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTest; 