import { generateToken } from '../utils/jwt';

export const createTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@thapar.edu',
  full_name: 'Test User',
  phone_number: '1234567890',
  gender: 'Male' as const,
  date_joined: new Date(),
  cognitoSub: 'cognito-sub-123',
  ...overrides,
});

export const createTestPool = (overrides = {}) => ({
  id: 'test-pool-id',
  start_point: 'Thapar University',
  end_point: 'Delhi',
  departure_time: new Date(Date.now() + 86400000), // Tomorrow
  arrival_time: new Date(Date.now() + 90000000), // Day after tomorrow
  transport_mode: 'Bus' as const,
  total_persons: 4,
  current_persons: 1,
  total_fare: 1000,
  is_female_only: false,
  created_by: 'test-user-id',
  ...overrides,
});

export const createTestPoolMember = (overrides = {}) => ({
  id: 'test-member-id',
  pool_id: 'test-pool-id',
  user_id: 'test-user-id',
  is_creator: false,
  ...overrides,
});

export const generateAuthToken = (userId = 'test-user-id', email = 'test@thapar.edu', isTemp = false) => {
  return generateToken({ userId, email, isTemp });
};

export const createPoolWithRelations = (pool: any) => ({
  ...pool,
  creator: {
    id: pool.created_by,
    full_name: 'Test Creator',
    email: 'creator@thapar.edu',
    phone_number: '9876543210',
    gender: 'Male' as const,
  },
  members: [
    {
      id: 'member-1',
      pool_id: pool.id,
      user_id: pool.created_by,
      is_creator: true,
      user: {
        id: pool.created_by,
        full_name: 'Test Creator',
        phone_number: '9876543210',
        gender: 'Male' as const,
      },
    },
  ],
});
