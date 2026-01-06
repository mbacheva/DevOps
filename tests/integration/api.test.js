const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Task API Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app).get('/health/live');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('UP');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/health/ready');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('READY');
      expect(response.body.database).toBe('connected');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(taskData.title);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate title length', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'ab' }); // Too short

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a specific task', async () => {
      // First create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Specific Task',
          description: 'Test description'
        });

      const taskId = createResponse.body.data.id;

      const response = await request(app).get(`/api/tasks/${taskId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).get('/api/tasks/99999');

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      // Create task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task to Update',
          status: 'pending'
        });

      const taskId = createResponse.body.data.id;

      // Update task
      const updateResponse = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: 'Updated Task',
          status: 'completed',
          priority: 'low'
        });

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.title).toBe('Updated Task');
      expect(updateResponse.body.data.status).toBe('completed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      // Create task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task to Delete'
        });

      const taskId = createResponse.body.data.id;

      // Delete task
      const deleteResponse = await request(app)
        .delete(`/api/tasks/${taskId}`);

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Verify deletion
      const getResponse = await request(app).get(`/api/tasks/${taskId}`);
      expect(getResponse.statusCode).toBe(404);
    });
  });
});
