import { User, Role } from '../types';
import { MOCK_USERS } from '../constants';
import { supabase } from '../supabase';

// Fallback credentials for Client-Side Login (Prototype Mode)
// In production, this should ONLY be handled by the server/database
const MOCK_CREDENTIALS: Record<string, string> = {
  'admin': 'admin123',
  'rudiaf': 'subarualam26'
};

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // 1. Try Supabase (Primary)
    if (import.meta.env.VITE_SUPABASE_URL) {
        let userDetails: any = null;

        // OPTION A: Using Supabase Auth (Requires Email)
        if (username.includes('@')) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: username,
                password: password
            });
            
            if (data.user && !error) {
                const { data: details } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                
                userDetails = details;
            }
        } 
        
        // OPTION B: Check Custom 'users' table (for non-email usernames like 'admin')
        if (!userDetails) {
            const { data: customUser } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
            
            userDetails = customUser;
        }

        if (userDetails) {
            // CHECK APPROVAL STATUS
            if (userDetails.is_approved === false || userDetails.isApproved === false) {
                throw new Error('Menunggu Persetujuan Admin');
            }

            // Normalize role
            let normalizedRole = Role.CASHIER;
            const dbRole = userDetails.role ? userDetails.role.toLowerCase() : '';
            
            if (dbRole === 'admin') normalizedRole = Role.ADMIN;
            else if (dbRole === 'manager') normalizedRole = Role.MANAGER;
            else if (dbRole === 'director') normalizedRole = Role.DIRECTOR;
            else if (dbRole === 'cashier') normalizedRole = Role.CASHIER;
            else if (dbRole === 'sales' || dbRole === 'sales marketing') normalizedRole = Role.SALES;
            else if (dbRole === 'debt collector' || dbRole === 'debt_collector') normalizedRole = Role.DEBT_COLLECTOR;
            else if (dbRole === 'rph_admin' || dbRole === 'admin rph') normalizedRole = Role.RPH_ADMIN;
            else if (dbRole === 'pelanggan' || dbRole === 'customer') normalizedRole = Role.CUSTOMER;

            const user: User = {
                id: userDetails.id,
                name: userDetails.name,
                username: userDetails.username,
                role: normalizedRole,
                avatar: userDetails.avatar || undefined, 
                employeeId: userDetails.employee_id || userDetails.employeeId || undefined,
                outletId: userDetails.outlet_id || userDetails.outletId || undefined,
                isApproved: true,
                referralCode: userDetails.referral_code || userDetails.referralCode || undefined
            };

            localStorage.setItem('auth_token', `sb-token-${user.id}`);
            return user;
        }
    }

    // 2. Fallback: Client-Side Login (For Demo Only)
    const validPassword = MOCK_CREDENTIALS[username];
    if (validPassword && validPassword === password) {
        const user = MOCK_USERS.find(u => u.username === username);
        if (user) {
            if (user.isApproved === false) {
                throw new Error('Menunggu Persetujuan Admin');
            }
            localStorage.setItem('auth_token', `mock-token-${user.id}`);
            return user;
        }
    }

    return null;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.message === 'Menunggu Persetujuan Admin') {
        throw error;
    }
    return null;
  }
};

export const verifySession = async (): Promise<User | null> => {
  const token = localStorage.getItem('auth_token');
  
  // Check Supabase Session
  if (import.meta.env.VITE_SUPABASE_URL) {
      try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
              // Fetch user details
               const { data: userDetails } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.session.user.id)
                    .single();
                if (userDetails) return userDetails as User;
          }
      } catch (error) {
          console.error('Supabase session check failed:', error);
          // Continue to token check
      }
  }

  if (!token) return null;

  // 1. Fallback for mock tokens
  if (token && token.startsWith('mock-token-')) {
      const userId = token.replace('mock-token-', '');
      const user = MOCK_USERS.find(u => u.id === userId);
      return user || null;
  }

  return null;
};

export const logoutUser = async () => {
  if (import.meta.env.VITE_SUPABASE_URL) {
      await supabase.auth.signOut();
  }
  localStorage.removeItem('auth_token');
  window.location.reload();
};

// --- USER MANAGEMENT ---

export const getUsers = async (): Promise<User[]> => {
    // 1. Try Supabase
    if (import.meta.env.VITE_SUPABASE_URL) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*');
            
            if (error) throw error;
            
            if (data) {
                return data.map(u => ({
                    id: u.id,
                    name: u.name,
                    username: u.username,
                    role: u.role as Role,
                    avatar: u.avatar,
                    employeeId: u.employee_id,
                    outletId: u.outlet_id,
                    isApproved: u.is_approved,
                    referralCode: u.referral_code,
                    referrerId: u.referrer_id,
                    totalEarnings: u.total_earnings || 0
                }));
            }
        } catch (error) {
            console.error('Supabase get users error:', error);
        }
    }

    // 2. Fallback to Mock
    return MOCK_USERS;
};

export const createUser = async (user: Partial<User> & { password: string; referrerCode?: string }): Promise<User | null> => {
    // 1. Try Supabase
    if (import.meta.env.VITE_SUPABASE_URL) {
        try {
            // Find referrer ID if code provided
            let referrerId: string | undefined;
            if (user.referrerCode) {
                const { data: referrerData } = await supabase
                    .from('users')
                    .select('id')
                    .eq('referral_code', user.referrerCode)
                    .single();
                if (referrerData) referrerId = referrerData.id;
            }

            // If username is email, try Supabase Auth
            let authId = `user-${Date.now()}`;
            if (user.username && user.username.includes('@')) {
                const { data, error } = await supabase.auth.signUp({
                    email: user.username,
                    password: user.password,
                    options: {
                        data: {
                            name: user.name,
                            role: user.role
                        }
                    }
                });
                if (error) throw error;
                if (data.user) authId = data.user.id;
            }

            // Insert into 'users' table
            const { data, error } = await supabase
                .from('users')
                .insert({
                    id: authId,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    password: user.password, // Ideally hashed, but storing plain for now as per existing pattern
                    is_approved: user.isApproved || false,
                    avatar: user.avatar,
                    employee_id: user.employeeId,
                    outlet_id: user.outletId,
                    referrer_id: referrerId
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                return {
                    id: data.id,
                    name: data.name,
                    username: data.username,
                    role: data.role as Role,
                    avatar: data.avatar,
                    employeeId: data.employee_id,
                    outletId: data.outlet_id,
                    isApproved: data.is_approved,
                    referrerId: data.referrer_id
                };
            }
        } catch (err) {
            console.error('Supabase create user error:', err);
        }
    }

    // 2. Mock Fallback (Simulate success for demo)
    console.warn('Using mock fallback for user creation');
    return {
        id: `mock-${Date.now()}`,
        name: user.name || 'New User',
        username: user.username || 'user',
        role: user.role || Role.CASHIER,
        isApproved: user.isApproved
    } as User;
};

export const updateUser = async (id: string, user: Partial<User> & { password?: string }): Promise<User | null> => {
    // 1. Try Supabase
    if (import.meta.env.VITE_SUPABASE_URL) {
        try {
            // A. Update 'users' table (Custom Data)
            const updates: Record<string, unknown> = {};
            if (user.name) updates.name = user.name;
            if (user.username) updates.username = user.username;
            if (user.role) updates.role = user.role;
            if (user.avatar) updates.avatar = user.avatar;
            if (user.employeeId) updates.employee_id = user.employeeId;
            if (user.outletId) updates.outlet_id = user.outletId;
            
            // If password is provided, update it in 'users' table (for custom auth users)
            // Note: In a real app, this should be hashed.
            if (user.password) updates.password = user.password;

            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // B. If updating SELF and Password is provided, try updating Supabase Auth
            // This only works if the user is logged in as themselves via Supabase Auth
            if (user.password) {
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData.session?.user.id === id) {
                    await supabase.auth.updateUser({ password: user.password });
                }
            }

            if (data) {
                 return {
                    id: data.id,
                    name: data.name,
                    username: data.username,
                    role: data.role as Role,
                    avatar: data.avatar,
                    employeeId: data.employee_id,
                    outletId: data.outlet_id
                };
            }
        } catch (err) {
            console.error('Supabase update user error:', err);
        }
    }

    // 2. Mock Fallback (for testing)
    const mockUserIndex = MOCK_USERS.findIndex(u => u.id === id);
    if (mockUserIndex >= 0) {
        const updatedUser = { ...MOCK_USERS[mockUserIndex], ...user };
        return updatedUser as User;
    }

    return null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
    // 1. Try Supabase
    if (import.meta.env.VITE_SUPABASE_URL) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase delete user error:', error);
        }
    }

    // 2. Mock Fallback
    console.warn('Using mock fallback for user deletion');
    return true; // Simulate success
};
