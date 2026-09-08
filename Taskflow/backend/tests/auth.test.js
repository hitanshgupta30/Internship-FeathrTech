const request = require('supertest');
const app = require('../src/app');
const authService = require('../src/services/auth.service');

describe('Authentication Endpoints', () => {
  beforeEach(() => {
    authService.resetStore();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.name).toBe('Jane Doe');
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.password).toBeUndefined(); // Must not leak password
    });

    it('should fail with 409 if email already exists', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123'
        });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Jane Clone',
          email: 'jane@example.com',
          password: 'Password456'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should fail with 400 when validation fails (invalid email, short password)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: '',
          email: 'not-an-email',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123'
        });
    });

    it('should log in an existing user and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject login with wrong password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/me & Protected Access', () => {
    it('should return current user profile when token is valid', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123'
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'Password123'
        });

      const token = loginRes.body.data.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.email).toBe('jane@example.com');
    });

    it('should reject access with 401 when token is missing or invalid', async () => {
      const resWithoutToken = await request(app).get('/api/auth/me');
      expect(resWithoutToken.status).toBe(401);
      expect(resWithoutToken.body.success).toBe(false);

      const resWithBadToken = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer bad.token.string');
      expect(resWithBadToken.status).toBe(401);
      expect(resWithBadToken.body.success).toBe(false);
    });
  });
});
