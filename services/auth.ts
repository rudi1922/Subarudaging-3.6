import { User, Role } from '../types';
import { MOCK_USERS } from '../constants';
import { supabase } from '../supabase';

// Fallback credentials for Client-Side Login (Prototype Mode)
const MOCK_CREDENTIALS: Record<string, string> = {
  'admin': 'admin123',
  'rudiaf': 'subarualam26'
};

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // 1. Try Supabase Auth (Primary)
    let userDetails: Record<string, unknown> | null = null;

    if (username.includes('@')) {
        const { data } = await supabase.auth.signInWithPassword({
            email: username,
            password: password
        });

        if (data?.user) {
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            if (profile) {
                userDetails = profile;
            }
        }
    }

    // 2. Check Custom 'users' table (for non-email usernames like 'admin')
    if (!userDetails) {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .maybeSingle();
        
        if (data) {
            userDetails = data;
        }
    }

    if (userDetails) {
        // CHECK APPROVAL STATUS
        const isApproved = userDetails.is_approved ?? userDetails.isApproved;
        if (isApproved === false) {
            throw new Error('Menunggu Persetujuan Admin');
        }

        // Normalize role
        let normalizedRole = Role.CASHIER;
        const dbRole = (userDetails.role || '').toLowerCase();
        
        if (dbRole === 'admin') normalizedRole = Role.ADMIN;
        else if (dbRole === 'manager') normalizedRole = Role.MANAGER;
        else if (dbRole === 'director') normalizedRole = Role.DIRECTOR;
        else if (dbRole === 'cashier') normalizedRole = Role.CASHIER;
        else if (dbRole === 'staff') normalizedRole = Role.STAFF;
        else if (dbRole === 'sales' || dbRole === 'sales marketing' || dbRole === 'sales_marketing') normalizedRole = Role.SALES;
        else if (dbRole === 'debt collector' || dbRole === 'debt_collector') normalizedRole = Role.DEBT_COLLECTOR;
        else if (dbRole === 'rph_admin' || dbRole === 'admin rph' || dbRole === 'admin_rph') normalizedRole = Role.RPH_ADMIN;
        else if (dbRole === 'pelanggan' || dbRole === 'customer') normalizedRole = Role.CUSTOMER;
        else if (dbRole === 'public') normalizedRole = Role.PUBLIC;

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

    // 3. Fallback: Mock Login (For Demo Only)
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
  } catch (error: unknown) {
    console.error('Login error:', error);
    if (error instanceof Error && error.message === 'Menunggu Persetujuan Admin') {
        throw error;
    }
    return null;
  }
};

export const verifySession = async (): Promise<User | null> => {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  // Check Supabase Session
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
      const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
      
      if (profile) {
          const isApproved = profile.is_approved ?? profile.isApproved;
          if (isApproved === false) {
              localStorage.removeItem('auth_token');
              return null;
          }

          let normalizedRole = Role.CASHIER;
          const dbRole = (profile.role || '').toLowerCase();
          
          if (dbRole === 'admin') normalizedRole = Role.ADMIN;
          else if (dbRole === 'manager') normalizedRole = Role.MANAGER;
          else if (dbRole === 'director') normalizedRole = Role.DIRECTOR;
          else if (dbRole === 'cashier') normalizedRole = Role.CASHIER;
          else if (dbRole === 'staff') normalizedRole = Role.STAFF;
          else if (dbRole === 'sales' || dbRole === 'sales marketing' || dbRole === 'sales_marketing') normalizedRole = Role.SALES;
          else if (dbRole === 'debt collector' || dbRole === 'debt_collector') normalizedRole = Role.DEBT_COLLECTOR;
          else if (dbRole === 'rph_admin' || dbRole === 'admin rph' || dbRole === 'admin_rph') normalizedRole = Role.RPH_ADMIN;
          else if (dbRole === 'pelanggan' || dbRole === 'customer') normalizedRole = Role.CUSTOMER;
          else if (dbRole === 'public') normalizedRole = Role.PUBLIC;

          return {
              id: profile.id,
              name: profile.name,
              username: profile.username,
              role: normalizedRole,
              avatar: profile.avatar || undefined, 
              employeeId: profile.employee_id || profile.employeeId || undefined,
              outletId: profile.outlet_id || profile.outletId || undefined,
              isApproved: true,
              referralCode: profile.referral_code || profile.referralCode || undefined
          } as User;
      }
  }

  // Handle Supabase Custom Tokens (sb-token-)
  if (token.startsWith('sb-token-')) {
      const userId = token.replace('sb-token-', '');
      const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
      
      if (profile) {
          const isApproved = profile.is_approved ?? profile.isApproved;
          if (isApproved === false) {
              localStorage.removeItem('auth_token');
              return null;
          }

          let normalizedRole = Role.CASHIER;
          const dbRole = (profile.role || '').toLowerCase();
          
          if (dbRole === 'admin') normalizedRole = Role.ADMIN;
          else if (dbRole === 'manager') normalizedRole = Role.MANAGER;
          else if (dbRole === 'director') normalizedRole = Role.DIRECTOR;
          else if (dbRole === 'cashier') normalizedRole = Role.CASHIER;
          else if (dbRole === 'staff') normalizedRole = Role.STAFF;
          else if (dbRole === 'sales' || dbRole === 'sales marketing' || dbRole === 'sales_marketing') normalizedRole = Role.SALES;
          else if (dbRole === 'debt collector' || dbRole === 'debt_collector') normalizedRole = Role.DEBT_COLLECTOR;
          else if (dbRole === 'rph_admin' || dbRole === 'admin rph' || dbRole === 'admin_rph') normalizedRole = Role.RPH_ADMIN;
          else if (dbRole === 'pelanggan' || dbRole === 'customer') normalizedRole = Role.CUSTOMER;
          else if (dbRole === 'public') normalizedRole = Role.PUBLIC;

          return {
              id: profile.id,
              name: profile.name,
              username: profile.username,
              role: normalizedRole,
              avatar: profile.avatar || undefined, 
              employeeId: profile.employee_id || profile.employeeId || undefined,
              outletId: profile.outlet_id || profile.outletId || undefined,
              isApproved: true,
              referralCode: profile.referral_code || profile.referralCode || undefined
          } as User;
      }
  }

  // Fallback for mock tokens
  if (token.startsWith('mock-token-')) {
      const userId = token.replace('mock-token-', '');
      const user = MOCK_USERS.find(u => u.id === userId);
      return user || null;
  }

  return null;
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('auth_token');
  window.location.reload();
};

// --- USER MANAGEMENT ---

export const getUsers = async (): Promise<User[]> => {
    try {
        const { data } = await supabase.from('users').select('*');
        return (data || []).map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            role: u.role as Role,
            avatar: u.avatar,
            employeeId: u.employee_id || u.employeeId,
            outletId: u.outlet_id || u.outletId,
            isApproved: u.is_approved || u.isApproved,
            referralCode: u.referral_code || u.referralCode,
            referrerId: u.referrer_id || u.referrerId,
            totalEarnings: u.total_earnings || u.totalEarnings || 0
        }));
    } catch (error) {
        console.error('Supabase get users error:', error);
        return MOCK_USERS;
    }
};

export const createUser = async (user: Partial<User> & { password: string; referrerCode?: string }): Promise<User | null> => {
    try {
        let authId = `user-${Date.now()}`;
        
        // 1. If username is email, try Supabase Auth
        if (user.username && user.username.includes('@')) {
            const { data } = await supabase.auth.signUp({
                email: user.username,
                password: user.password
            });
            if (data?.user) {
                authId = data.user.id;
            }
        }

        const userPayload = {
            id: authId,
            name: user.name,
            username: user.username,
            role: user.role,
            password: user.password,
            is_approved: user.isApproved || false,
            avatar: user.avatar || '',
            employee_id: user.employeeId || '',
            outlet_id: user.outletId || '',
            created_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase.from('users').insert(userPayload);
        if (insertError) throw insertError;

        return {
            id: authId,
            ...userPayload,
            role: user.role as Role,
            isApproved: user.isApproved || false
        } as User;
    } catch (err) {
        console.error('Supabase create user error:', err);
        return null;
    }
};

export const updateUser = async (id: string, user: Partial<User> & { password?: string }): Promise<User | null> => {
    try {
        const updates: Record<string, unknown> = { ...user as Record<string, unknown> };
        
        if (updates.employeeId) updates.employee_id = updates.employeeId;
        if (updates.outletId) updates.outlet_id = updates.outletId;
        if (updates.isApproved !== undefined) updates.is_approved = updates.isApproved;

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data as User;
    } catch (err) {
        console.error('Supabase update user error:', err);
    }
    return null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Supabase delete user error:', error);
        return false;
    }
};
