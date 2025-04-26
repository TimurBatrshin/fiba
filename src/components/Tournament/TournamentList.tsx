import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { 
  fetchTournaments, 
  fetchUpcomingTournaments, 
  fetchPastTournaments,
  setFilter,
  clearFilters
} from '../../store/slices/tournamentSlice';
import { AppDispatch, RootState } from '../../store';
import { Link } from 'react-router-dom';
import defaultTournamentImg from '../../assets/images/default-tournament.jpg';

// Вспомогательные функции для форматирования данных
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getTournamentStatusBadge = (status: string): { text: string; variant: string } => {
  switch(status.toUpperCase()) {
    case 'ACTIVE':
      return { text: 'Активный', variant: 'success' };
    case 'UPCOMING':
      return { text: 'Предстоящий', variant: 'primary' };
    case 'COMPLETED':
    case 'PAST':
      return { text: 'Завершенный', variant: 'secondary' };
    default:
      return { text: status, variant: 'light' };
  }
};

const TournamentList: React.FC = () => {
  // Redux состояние
  const dispatch = useDispatch<AppDispatch>();
  const { tournaments, loading, error, filter } = useSelector((state: RootState) => state.tournaments);
  
  // Локальное состояние для фильтров
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Загрузка турниров при монтировании компонента
  useEffect(() => {
    dispatch(fetchTournaments({}));
  }, [dispatch]);
  
  // Обработчики фильтрации
  const handleShowAll = () => {
    dispatch(clearFilters());
    dispatch(fetchTournaments({}));
  };
  
  const handleShowUpcoming = () => {
    dispatch(fetchUpcomingTournaments());
  };
  
  const handleShowPast = () => {
    dispatch(fetchPastTournaments());
  };
  
  // Обработчик поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(setFilter({ search: searchQuery }));
      dispatch(fetchTournaments({ 
        ...filter, 
        sort: filter?.sort || 'date',
        direction: filter?.direction || 'asc'
      }));
    }
  };
  
  // Обработчик сортировки
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sort, direction] = e.target.value.split('-');
    dispatch(setFilter({ sort, direction }));
    dispatch(fetchTournaments({ 
      ...filter, 
      sort, 
      direction
    }));
  };

  // Обработчик ошибки загрузки изображения турнира
  const handleTournamentImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultTournamentImg;
    e.currentTarget.onerror = null; // Предотвращаем бесконечный цикл
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Турниры</h2>
      
      {/* Фильтры и поиск */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="d-flex gap-2">
            <Button
              variant={!filter?.status ? 'primary' : 'outline-primary'}
              onClick={handleShowAll}
            >
              Все
            </Button>
            <Button
              variant={filter?.status === 'UPCOMING' ? 'primary' : 'outline-primary'}
              onClick={handleShowUpcoming}
            >
              Предстоящие
            </Button>
            <Button
              variant={filter?.status === 'PAST' ? 'primary' : 'outline-primary'}
              onClick={handleShowPast}
            >
              Прошедшие
            </Button>
          </div>
        </Col>
        <Col md={3}>
          <Form.Select 
            onChange={handleSortChange}
            value={`${filter?.sort || 'date'}-${filter?.direction || 'asc'}`}
          >
            <option value="date-asc">По дате (сначала ранние)</option>
            <option value="date-desc">По дате (сначала поздние)</option>
            <option value="title-asc">По названию (А-Я)</option>
            <option value="title-desc">По названию (Я-А)</option>
            <option value="prize_pool-desc">По призовому фонду (убывание)</option>
            <option value="prize_pool-asc">По призовому фонду (возрастание)</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form onSubmit={handleSearch}>
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Поиск турниров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="secondary">
                Поиск
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      
      {/* Индикатор загрузки */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      )}
      
      {/* Сообщение об ошибке */}
      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}
      
      {/* Список турниров */}
      {!loading && !error && (
        <>
          {tournaments.length === 0 ? (
            <Alert variant="info" className="my-3">
              Турниры не найдены. Попробуйте изменить параметры поиска.
            </Alert>
          ) : (
            <Row>
              {tournaments.map((tournament) => {
                const { text, variant } = getTournamentStatusBadge(tournament.status);
                
                // Получаем изображение турнира из imageUrl или tournament_image
                const tournamentImage = (tournament as any).tournament_image || tournament.imageUrl;
                // Получаем название из title или name
                const tournamentTitle = tournament.title || tournament.name;
                // Получаем призовой фонд из prize_pool или prizePool
                const prizeFund = (tournament as any).prize_pool || tournament.prizePool;
                
                return (
                  <Col key={tournament.id} md={4} className="mb-4">
                    <Card className="h-100 tournament-card">
                      {tournamentImage && (
                        <Card.Img 
                          variant="top" 
                          src={tournamentImage} 
                          alt={tournamentTitle}
                          style={{ height: '180px', objectFit: 'cover' }}
                          onError={handleTournamentImageError}
                        />
                      )}
                      <Card.Body>
                        <div className={`badge bg-${variant} mb-2`}>{text}</div>
                        <Card.Title>{tournamentTitle}</Card.Title>
                        <Card.Text>
                          <strong>Дата:</strong> {formatDate(tournament.date)}<br />
                          <strong>Место:</strong> {tournament.location}<br />
                          <strong>Уровень:</strong> {tournament.level}<br />
                          <strong>Призовой фонд:</strong> {prizeFund} ₽
                        </Card.Text>
                        <Link to={`/tournament/${tournament.id}`}>
                          <Button variant="primary">Подробнее</Button>
                        </Link>
                        {tournament.status.toUpperCase() === 'UPCOMING' && (
                          <Link to={`/tournament/${tournament.id}/register`} className="ms-2">
                            <Button variant="success">Регистрация</Button>
                          </Link>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default TournamentList; 