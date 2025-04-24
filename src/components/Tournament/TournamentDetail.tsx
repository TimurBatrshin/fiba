import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { fetchTournamentById, clearActiveTournament } from '../../store/slices/tournamentSlice';
import { AppDispatch, RootState } from '../../store';

// Форматирование даты
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Статус турнира
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

const TournamentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeTournament: tournament, loading, error } = useSelector(
    (state: RootState) => state.tournaments
  );

  // Загрузка данных турнира при монтировании компонента
  useEffect(() => {
    if (id) {
      dispatch(fetchTournamentById(parseInt(id)));
    }
    
    // Очистка данных при размонтировании компонента
    return () => {
      dispatch(clearActiveTournament());
    };
  }, [dispatch, id]);

  // Навигация на страницу регистрации
  const handleRegister = () => {
    navigate(`/tournaments/${id}/register`);
  };

  // Навигация назад к списку турниров
  const handleBack = () => {
    navigate('/tournaments');
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="primary" onClick={handleBack}>
          Вернуться к списку турниров
        </Button>
      </Container>
    );
  }

  if (!tournament) {
    return (
      <Container className="my-5">
        <Alert variant="info">
          Турнир не найден
        </Alert>
        <Button variant="primary" onClick={handleBack}>
          Вернуться к списку турниров
        </Button>
      </Container>
    );
  }

  const { text, variant } = getTournamentStatusBadge(tournament.status);

  // Получаем изображение турнира из imageUrl или tournament_image (для обратной совместимости)
  const tournamentImage = (tournament as any).tournament_image || tournament.imageUrl;
  // Получаем название из title или name
  const tournamentTitle = tournament.title || tournament.name;
  // Получаем призовой фонд из prize_pool или prizePool
  const prizeFund = (tournament as any).prize_pool || tournament.prizePool;
  // Получаем имя спонсора из sponsor_name или sponsorName
  const sponsorName = (tournament as any).sponsor_name || tournament.sponsorName;
  // Получаем тип бизнеса из business_type или businessType
  const businessType = (tournament as any).business_type || tournament.businessType;
  // Получаем логотип спонсора из sponsor_logo или sponsorLogo
  const sponsorLogo = (tournament as any).sponsor_logo || tournament.sponsorLogo;

  return (
    <Container className="my-5">
      <Button variant="outline-primary" onClick={handleBack} className="mb-4">
        &larr; Назад к списку
      </Button>
      
      <Card>
        <Row className="g-0">
          <Col md={4}>
            {tournamentImage ? (
              <Card.Img 
                src={tournamentImage} 
                alt={tournamentTitle} 
                className="img-fluid rounded-start"
                style={{ height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center h-100">
                <span className="text-muted">Нет изображения</span>
              </div>
            )}
          </Col>
          <Col md={8}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <Card.Title className="fs-2">{tournamentTitle}</Card.Title>
                <Badge bg={variant} className="fs-6 py-2 px-3">{text}</Badge>
              </div>
              
              <Card.Text as="div">
                <div className="mb-3">
                  <h5>Основная информация</h5>
                  <p className="mb-1"><strong>Дата проведения:</strong> {formatDate(tournament.date)}</p>
                  <p className="mb-1"><strong>Место проведения:</strong> {tournament.location}</p>
                  <p className="mb-1"><strong>Уровень турнира:</strong> {tournament.level}</p>
                  <p className="mb-3"><strong>Призовой фонд:</strong> {prizeFund} ₽</p>
                </div>
                
                {tournament.description && (
                  <div className="mb-3">
                    <h5>Описание</h5>
                    <p>{tournament.description}</p>
                  </div>
                )}
                
                {(sponsorName || businessType) && (
                  <div className="mb-3">
                    <h5>Спонсор</h5>
                    {sponsorName && <p className="mb-1"><strong>Имя:</strong> {sponsorName}</p>}
                    {businessType && <p className="mb-1"><strong>Тип бизнеса:</strong> {businessType}</p>}
                    {sponsorLogo && (
                      <img 
                        src={sponsorLogo} 
                        alt={sponsorName || 'Спонсор'} 
                        style={{ maxHeight: '50px', maxWidth: '150px' }}
                        className="mt-2"
                      />
                    )}
                  </div>
                )}
              </Card.Text>
              
              {tournament.status.toUpperCase() === 'UPCOMING' && (
                <Button variant="success" size="lg" onClick={handleRegister}>
                  Зарегистрироваться
                </Button>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default TournamentDetail; 