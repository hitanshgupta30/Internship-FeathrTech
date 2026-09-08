const request = require('supertest');
const app = require('../src/app');
const authService = require('../src/services/auth.service');
const projectService = require('../src/services/project.service');
const taskService = require('../src/services/task.service');

describe('Task and Project Endpoints', () => {
  let authToken;
  let user;
  let project;

  beforeEach(async () => {
    authService.resetStore();
    projectService.resetStore();
    taskService.resetStore();

    // Create a test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Developer Dan',
        email: 'dan@example.com',
        password: 'Password123'
      });
    user = signupRes.body.data.user;

    // Login user to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dan@example.com',
        password: 'Password123'
      });
    authToken = loginRes.body.data.token;

    // Create a project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Sprint 1',
        description: 'First sprint board'
      });
    project = projRes.body.data.project;
  });

  describe('Task Validation & Creation', () => {
    it('should fail with 400 when task title is empty', async () => {
      const res = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '',
          description: 'Empty title test',
          status: 'todo'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('should fail with 400 when status is invalid', async () => {
      const res = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Valid Title',
          status: 'invalid_status_type'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should create a new task under project with default status and priority', async () => {
      const res = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Build Authentication',
          description: 'Implement JWT login workflow',
          priority: 'high'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Build Authentication');
      expect(res.body.data.task.status).toBe('todo');
      expect(res.body.data.task.priority).toBe('high');
      expect(res.body.data.task.projectId).toBe(project.id);
    });
  });

  describe('Task Lifecycle (Get, Update, Comments, Delete)', () => {
    let task;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Setup Express App',
          description: 'Initial boilerplate setup',
          status: 'todo',
          priority: 'medium',
          assigneeId: user.id
        });
      task = res.body.data.task;
    });

    it('should fetch tasks for the project', async () => {
      const res = await request(app)
        .get(`/api/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].id).toBe(task.id);
    });

    it('should update task status and priority', async () => {
      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'in_progress',
          priority: 'high'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.status).toBe('in_progress');
      expect(res.body.data.task.priority).toBe('high');
    });

    it('should add comments and retrieve them in chronological order', async () => {
      // Add first comment
      await request(app)
        .post(`/api/tasks/${task.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ body: 'Starting work on this task now.' });

      // Add second comment
      await request(app)
        .post(`/api/tasks/${task.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ body: 'PR submitted for review.' });

      const res = await request(app)
        .get(`/api/tasks/${task.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.comments.length).toBe(2);
      expect(res.body.data.comments[0].body).toBe('Starting work on this task now.');
      expect(res.body.data.comments[1].body).toBe('PR submitted for review.');
    });

    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify task no longer exists
      const getRes = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});
