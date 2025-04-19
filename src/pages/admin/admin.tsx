import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  return (
    <Container className="mt-4">
      <h1>Admin Dashboard</h1>
      <Row className="mt-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Tournament Management</Card.Title>
              <Card.Text>
                Create and manage tournaments
              </Card.Text>
              <Link to="/admin/create-tournament" className="btn btn-primary">
                Create Tournament
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>User Management</Card.Title>
              <Card.Text>
                Manage user accounts and permissions
              </Card.Text>
              <Link to="/admin/users" className="btn btn-primary">
                Manage Users
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Statistics</Card.Title>
              <Card.Text>
                View and manage tournament statistics
              </Card.Text>
              <Link to="/admin/statistics" className="btn btn-primary">
                View Statistics
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin; 