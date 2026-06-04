import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProjectCard from '../components/ProjectCard';

const Home = () => {
  // Nanti bagian ini diganti dengan fetch data dari API MySQL
  const dummyProjects = [
    { id: 1, title: 'Project Orderly', description: 'Web manajemen tugas keren', github: '#', demo: '#' },
    { id: 2, title: 'ProjectSpace', description: 'Platform portfolio mahasiswa', github: '#', demo: '#' }
  ];

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Selamat Datang di ProjectSpace</h1>
        <p className="text-muted">Tempat berbagi ide dan karya mahasiswa</p>
      </div>

      <Row className="g-4">
        {dummyProjects.map((project) => (
          <Col md={4} key={project.id}>
            <ProjectCard 
              title={project.title} 
              description={project.description}
              githubLink={project.github}
              demoLink={project.demo}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;