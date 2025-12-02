// Mock environment variables FIRST
process.env.JWT_ACCESS_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '604800';
process.env.TEMP_TOKEN_EXPIRES_IN = '900';
process.env.NODE_ENV = 'test';

// Enable manual mocks
jest.mock('../db/prismaClient');
jest.mock('../utils/cognito-auth');
jest.mock('../utils/google-auth');

// Mock logger to reduce noise in tests
jest.mock('../utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});
