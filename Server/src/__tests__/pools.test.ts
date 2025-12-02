import './setup';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../db/prismaClient';
import { createTestUser, createTestPool, generateAuthToken, createPoolWithRelations, createTestPoolMember } from './helpers';

const app = createApp();
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Pool Routes', () => {
  const token = generateAuthToken();
  const testUser = createTestUser();

  describe('GET /api/pools', () => {
    it('should get all pools with filters', async () => {
      const pools = [
        createPoolWithRelations(createTestPool()),
        createPoolWithRelations(createTestPool({ id: 'pool-2', end_point: 'Mumbai' })),
      ];

      mockPrisma.pool.findMany.mockResolvedValue(pools);

      const response = await request(app)
        .get('/api/pools')
        .set('Authorization', `Bearer ${token}`)
        .query({ end_point: 'Delhi' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pools).toBeDefined();
      expect(Array.isArray(response.body.pools)).toBe(true);
    });

    it('should filter female-only pools', async () => {
      const femalePool = createPoolWithRelations(createTestPool({ is_female_only: true }));
      
      mockPrisma.pool.findMany.mockResolvedValue([femalePool]);

      const response = await request(app)
        .get('/api/pools')
        .set('Authorization', `Bearer ${token}`)
        .query({ is_female_only: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/pools');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pools/:id', () => {
    it('should get pool by ID', async () => {
      const pool = createPoolWithRelations(createTestPool());

      mockPrisma.pool.findUnique.mockResolvedValue(pool);

      const response = await request(app)
        .get('/api/pools/test-pool-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pool).toBeDefined();
      expect(response.body.pool.id).toBe('test-pool-id');
    });

    it('should return 404 for non-existent pool', async () => {
      mockPrisma.pool.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/pools/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/pools', () => {
    it('should create a new pool successfully', async () => {
      const poolData = {
        start_point: 'Thapar University',
        end_point: 'Delhi',
        departure_time: new Date(Date.now() + 86400000).toISOString(),
        arrival_time: new Date(Date.now() + 90000000).toISOString(),
        transport_mode: 'Bus',
        total_persons: 4,
        total_fare: 1000,
        is_female_only: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      
      const createdPool = createTestPool();
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return createdPool;
      });

      const poolWithRelations = createPoolWithRelations(createdPool);
      mockPrisma.pool.findUnique.mockResolvedValue(poolWithRelations);

      const response = await request(app)
        .post('/api/pools')
        .set('Authorization', `Bearer ${token}`)
        .send(poolData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.pool).toBeDefined();
      expect(response.body.message).toContain('created successfully');
    });

    it('should reject pool with missing required fields', async () => {
      const invalidPoolData = {
        start_point: 'Thapar University',
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/pools')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPoolData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should reject pool with invalid total_persons', async () => {
      const poolData = {
        start_point: 'Thapar University',
        end_point: 'Delhi',
        departure_time: new Date(Date.now() + 86400000).toISOString(),
        arrival_time: new Date(Date.now() + 90000000).toISOString(),
        transport_mode: 'Bus',
        total_persons: 100, // Invalid: > 50
        total_fare: 1000,
      };

      const response = await request(app)
        .post('/api/pools')
        .set('Authorization', `Bearer ${token}`)
        .send(poolData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Total persons must be between 2 and 50');
    });

    it('should reject pool with past departure time', async () => {
      const poolData = {
        start_point: 'Thapar University',
        end_point: 'Delhi',
        departure_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        arrival_time: new Date(Date.now() + 90000000).toISOString(),
        transport_mode: 'Bus',
        total_persons: 4,
        total_fare: 1000,
      };

      const response = await request(app)
        .post('/api/pools')
        .set('Authorization', `Bearer ${token}`)
        .send(poolData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Departure time must be in the future');
    });

    it('should reject female-only pool created by male user', async () => {
      const maleUser = createTestUser({ gender: 'Male' });
      mockPrisma.user.findUnique.mockResolvedValue(maleUser);

      const poolData = {
        start_point: 'Thapar University',
        end_point: 'Delhi',
        departure_time: new Date(Date.now() + 86400000).toISOString(),
        arrival_time: new Date(Date.now() + 90000000).toISOString(),
        transport_mode: 'Bus',
        total_persons: 4,
        total_fare: 1000,
        is_female_only: true,
      };

      const response = await request(app)
        .post('/api/pools')
        .set('Authorization', `Bearer ${token}`)
        .send(poolData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only female users can create female-only pools');
    });
  });

  describe('POST /api/pools/:id/join', () => {
    it('should join pool successfully', async () => {
      const pool = createTestPool({ current_persons: 2 });
      const poolWithMembers = {
        ...pool,
        members: [
          { id: 'member-1', user_id: 'other-user-id', pool_id: pool.id, is_creator: true },
        ],
      };

      mockPrisma.pool.findUnique
        .mockResolvedValueOnce(poolWithMembers)
        .mockResolvedValueOnce(createPoolWithRelations({ ...pool, current_persons: 3 }));
      
      mockPrisma.user.findUnique.mockResolvedValue(testUser);
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      const response = await request(app)
        .post('/api/pools/test-pool-id/join')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Successfully joined');
    });

    it('should reject joining when already a member', async () => {
      const pool = createTestPool();
      const poolWithMembers = {
        ...pool,
        members: [
          { id: 'member-1', user_id: testUser.id, pool_id: pool.id, is_creator: false },
        ],
      };

      mockPrisma.pool.findUnique.mockResolvedValue(poolWithMembers);

      const response = await request(app)
        .post('/api/pools/test-pool-id/join')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already a member');
    });

    it('should reject joining full pool', async () => {
      const pool = createTestPool({ current_persons: 4, total_persons: 4 });
      const poolWithMembers = {
        ...pool,
        members: [],
      };

      mockPrisma.pool.findUnique.mockResolvedValue(poolWithMembers);

      const response = await request(app)
        .post('/api/pools/test-pool-id/join')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('pool is full');
    });

    it('should reject male user joining female-only pool', async () => {
      const maleUser = createTestUser({ gender: 'Male' });
      const pool = createTestPool({ is_female_only: true });
      const poolWithMembers = { ...pool, members: [] };

      mockPrisma.pool.findUnique.mockResolvedValue(poolWithMembers);
      mockPrisma.user.findUnique.mockResolvedValue(maleUser);

      const response = await request(app)
        .post('/api/pools/test-pool-id/join')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('female-only');
    });
  });

  describe('POST /api/pools/:id/leave', () => {
    it('should leave pool successfully', async () => {
      const membership = createTestPoolMember({ user_id: testUser.id, is_creator: false });
      
      mockPrisma.poolMember.findFirst.mockResolvedValue(membership);
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      const response = await request(app)
        .post('/api/pools/test-pool-id/leave')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Successfully left');
    });

    it('should reject when user is not a member', async () => {
      mockPrisma.poolMember.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/pools/test-pool-id/leave')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not a member');
    });

    it('should reject pool creator from leaving', async () => {
      const membership = createTestPoolMember({ user_id: testUser.id, is_creator: true });
      
      mockPrisma.poolMember.findFirst.mockResolvedValue(membership);

      const response = await request(app)
        .post('/api/pools/test-pool-id/leave')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('creator cannot leave');
    });
  });

  describe('DELETE /api/pools/:id', () => {
    it('should delete pool successfully', async () => {
      const pool = createTestPool({ created_by: testUser.id });
      
      mockPrisma.pool.findUnique.mockResolvedValue(pool);
      mockPrisma.pool.delete.mockResolvedValue(pool);

      const response = await request(app)
        .delete('/api/pools/test-pool-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should reject deletion by non-creator', async () => {
      const pool = createTestPool({ created_by: 'other-user-id' });
      
      mockPrisma.pool.findUnique.mockResolvedValue(pool);

      const response = await request(app)
        .delete('/api/pools/test-pool-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only the pool creator');
    });

    it('should return 404 for non-existent pool', async () => {
      mockPrisma.pool.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/pools/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/pools/users/me/pools', () => {
    it('should get user created and joined pools', async () => {
      const createdPools = [createPoolWithRelations(createTestPool({ created_by: testUser.id }))];
      const memberships = [
        {
          id: 'membership-1',
          pool_id: 'joined-pool-id',
          user_id: testUser.id,
          is_creator: false,
          pool: createPoolWithRelations(createTestPool({ id: 'joined-pool-id' })),
        },
      ];

      mockPrisma.pool.findMany.mockResolvedValue(createdPools);
      mockPrisma.poolMember.findMany.mockResolvedValue(memberships);

      const response = await request(app)
        .get('/api/pools/users/me/pools')
        .set('Authorization', `Bearer ${token}`)
        .query({ type: 'all' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.created_pools).toBeDefined();
      expect(response.body.joined_pools).toBeDefined();
    });

    it('should get only created pools', async () => {
      const createdPools = [createPoolWithRelations(createTestPool({ created_by: testUser.id }))];

      mockPrisma.pool.findMany.mockResolvedValue(createdPools);

      const response = await request(app)
        .get('/api/pools/users/me/pools')
        .set('Authorization', `Bearer ${token}`)
        .query({ type: 'created' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.created_pools).toBeDefined();
    });

    it('should get only joined pools', async () => {
      const memberships = [
        {
          id: 'membership-1',
          pool_id: 'joined-pool-id',
          user_id: testUser.id,
          is_creator: false,
          pool: createPoolWithRelations(createTestPool({ id: 'joined-pool-id' })),
        },
      ];

      mockPrisma.poolMember.findMany.mockResolvedValue(memberships);

      const response = await request(app)
        .get('/api/pools/users/me/pools')
        .set('Authorization', `Bearer ${token}`)
        .query({ type: 'joined' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.joined_pools).toBeDefined();
    });
  });
});
