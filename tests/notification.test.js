const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Notification = require('../src/models/Notification');

describe('Notification API (Member 2)', () => {
  let user1Token, user1;
  let user2Token, user2;

  beforeEach(async () => {
    user1 = await User.create({
      name: 'User One',
      email: 'user1@mediflow.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    const login1 = await request(app).post('/api/v1/auth/login').send({
      email: 'user1@mediflow.com',
      password: 'password123',
    });
    user1Token = login1.body.data.token;

    user2 = await User.create({
      name: 'User Two',
      email: 'user2@mediflow.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    const login2 = await request(app).post('/api/v1/auth/login').send({
      email: 'user2@mediflow.com',
      password: 'password123',
    });
    user2Token = login2.body.data.token;
  });

  describe('Notification Retrieval and Operations', () => {
    let notif1, notif2, notifForUser2;

    beforeEach(async () => {
      notif1 = await Notification.create({
        recipient: user1._id,
        type: 'APPOINTMENT_CONFIRMED',
        message: 'Your appointment is confirmed',
        isRead: false,
      });

      notif2 = await Notification.create({
        recipient: user1._id,
        type: 'PRESCRIPTION_AVAILABLE',
        message: 'Your prescription is ready',
        isRead: false,
      });

      notifForUser2 = await Notification.create({
        recipient: user2._id,
        type: 'APPOINTMENT_CREATED',
        message: 'Appointment booked',
        isRead: false,
      });
    });

    it('should list only own notifications for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.some((n) => n.message === 'Your prescription is ready')).toBe(true);
    });

    it('should return accurate unread count', async () => {
      const res = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.unreadCount).toBe(2);
    });

    it('should mark a single notification as read', async () => {
      const res = await request(app)
        .patch(`/api/v1/notifications/${notif1._id}/read`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isRead).toBe(true);

      const countRes = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(countRes.body.data.unreadCount).toBe(1);
    });

    it('should block user from marking another user notification as read', async () => {
      const res = await request(app)
        .patch(`/api/v1/notifications/${notifForUser2._id}/read`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .patch('/api/v1/notifications/mark-all-read')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);

      const countRes = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(countRes.body.data.unreadCount).toBe(0);
    });
  });
});
