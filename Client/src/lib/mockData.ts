// Mock data utilities for Thapargo

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: 'Male' | 'Female';
  hasCompletedOnboarding: boolean;
}

export interface PoolMember {
  name: string;
  gender: 'Male' | 'Female';
  is_creator: boolean;
}

export interface Pool {
  id: string;
  start_point: string;
  end_point: string;
  departure_time: string;
  arrival_time: string;
  transport_mode: 'car' | 'bike' | 'plane' | 'ferry' | 'train' | 'bus';
  total_persons: number;
  current_persons: number;
  fare_per_head: string;
  is_female_only: boolean;
  created_by: string;
  members: PoolMember[];
}

// Mock users storage
const USERS_KEY = 'thapargo_users';
const CURRENT_USER_KEY = 'thapargo_current_user';
const POOLS_KEY = 'thapargo_pools';

// Initialize with some mock pools
const initialPools: Pool[] = [
  {
    id: '1',
    start_point: 'Thapar University',
    end_point: 'Chandigarh',
    departure_time: '2025-12-01T09:00:00',
    arrival_time: '2025-12-01T11:00:00',
    transport_mode: 'car',
    total_persons: 4,
    current_persons: 2,
    fare_per_head: '200.00',
    is_female_only: false,
    created_by: 'Aman Sharma',
    members: [
      { name: 'Aman Sharma', gender: 'Male', is_creator: true },
      { name: 'Neha Singh', gender: 'Female', is_creator: false }
    ]
  },
  {
    id: '2',
    start_point: 'Chandigarh',
    end_point: 'Delhi',
    departure_time: '2025-12-01T14:00:00',
    arrival_time: '2025-12-01T18:30:00',
    transport_mode: 'car',
    total_persons: 4,
    current_persons: 3,
    fare_per_head: '400.00',
    is_female_only: true,
    created_by: 'Priya Mehta',
    members: [
      { name: 'Priya Mehta', gender: 'Female', is_creator: true },
      { name: 'Anjali Kumar', gender: 'Female', is_creator: false },
      { name: 'Riya Patel', gender: 'Female', is_creator: false }
    ]
  },
  {
    id: '3',
    start_point: 'Patiala',
    end_point: 'Thapar University',
    departure_time: '2025-12-02T08:00:00',
    arrival_time: '2025-12-02T09:00:00',
    transport_mode: 'bike',
    total_persons: 2,
    current_persons: 1,
    fare_per_head: '50.00',
    is_female_only: false,
    created_by: 'Rohit Verma',
    members: [
      { name: 'Rohit Verma', gender: 'Male', is_creator: true }
    ]
  },
  {
    id: '4',
    start_point: 'Delhi Airport',
    end_point: 'Thapar University',
    departure_time: '2025-12-03T20:00:00',
    arrival_time: '2025-12-03T23:30:00',
    transport_mode: 'car',
    total_persons: 3,
    current_persons: 1,
    fare_per_head: '600.00',
    is_female_only: false,
    created_by: 'Karan Singh',
    members: [
      { name: 'Karan Singh', gender: 'Male', is_creator: true }
    ]
  }
];

// Initialize pools if not exists
export const initializePools = () => {
  const pools = localStorage.getItem(POOLS_KEY);
  if (!pools) {
    localStorage.setItem(POOLS_KEY, JSON.stringify(initialPools));
  }
};

// Auth functions
export const mockSignup = (email: string, password: string, fullName: string): { success: boolean; error?: string } => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find((u: User) => u.email === email)) {
    return { success: false, error: 'User already exists' };
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    fullName,
    hasCompletedOnboarding: false
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  return { success: true };
};

export const mockLogin = (email: string, password: string): { success: boolean; error?: string; user?: User } => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: User) => u.email === email);

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
};

export const mockGoogleAuth = (email: string, fullName: string): { success: boolean; user: User } => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  let user = users.find((u: User) => u.email === email);

  if (!user) {
    // Create new user
    user = {
      id: Date.now().toString(),
      email,
      fullName,
      hasCompletedOnboarding: false
    };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
};

export const mockLogout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const completeOnboarding = (phone: string, gender: 'Male' | 'Female'): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  currentUser.phone = phone;
  currentUser.gender = gender;
  currentUser.hasCompletedOnboarding = true;

  // Update in storage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  
  // Update in users list
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const index = users.findIndex((u: User) => u.id === currentUser.id);
  if (index !== -1) {
    users[index] = currentUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  return true;
};

// Pool functions
export const getAllPools = (): Pool[] => {
  initializePools();
  return JSON.parse(localStorage.getItem(POOLS_KEY) || '[]');
};

export const getPoolById = (id: string): Pool | null => {
  const pools = getAllPools();
  return pools.find(p => p.id === id) || null;
};

export const createPool = (poolData: Omit<Pool, 'id' | 'current_persons' | 'members' | 'created_by'>): Pool => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('User not authenticated');

  const newPool: Pool = {
    ...poolData,
    id: Date.now().toString(),
    current_persons: 1,
    created_by: currentUser.fullName,
    members: [
      {
        name: currentUser.fullName,
        gender: currentUser.gender!,
        is_creator: true
      }
    ]
  };

  const pools = getAllPools();
  pools.push(newPool);
  localStorage.setItem(POOLS_KEY, JSON.stringify(pools));

  return newPool;
};

export const joinPool = (poolId: string): { success: boolean; error?: string } => {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'User not authenticated' };

  const pools = getAllPools();
  const poolIndex = pools.findIndex(p => p.id === poolId);
  
  if (poolIndex === -1) return { success: false, error: 'Pool not found' };

  const pool = pools[poolIndex];

  // Check if pool is full
  if (pool.current_persons >= pool.total_persons) {
    return { success: false, error: 'Pool is full' };
  }

  // Check if already a member
  if (pool.members.find(m => m.name === currentUser.fullName)) {
    return { success: false, error: 'Already a member' };
  }

  // Check female-only restriction
  if (pool.is_female_only && currentUser.gender !== 'Female') {
    return { success: false, error: 'This pool is female-only' };
  }

  // Add member
  pool.members.push({
    name: currentUser.fullName,
    gender: currentUser.gender!,
    is_creator: false
  });
  pool.current_persons++;

  pools[poolIndex] = pool;
  localStorage.setItem(POOLS_KEY, JSON.stringify(pools));

  return { success: true };
};

export const leavePool = (poolId: string): { success: boolean; error?: string } => {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'User not authenticated' };

  const pools = getAllPools();
  const poolIndex = pools.findIndex(p => p.id === poolId);
  
  if (poolIndex === -1) return { success: false, error: 'Pool not found' };

  const pool = pools[poolIndex];

  // Check if user is creator
  const memberIndex = pool.members.findIndex(m => m.name === currentUser.fullName);
  if (memberIndex === -1) return { success: false, error: 'Not a member' };

  if (pool.members[memberIndex].is_creator) {
    return { success: false, error: 'Creator cannot leave the pool' };
  }

  // Remove member
  pool.members.splice(memberIndex, 1);
  pool.current_persons--;

  pools[poolIndex] = pool;
  localStorage.setItem(POOLS_KEY, JSON.stringify(pools));

  return { success: true };
};
