// app/services/user-service.ts
import { api } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  username: string;
  whatsapp: string;
  role: 'ADMIN' | 'KASIR';
  passwordChanged?: boolean;
}

export interface CreateUserPayload {
  name: string;
  username: string;
  whatsapp: string;
  password: string;
  role?: 'ADMIN' | 'KASIR';
}

export interface UpdateUserPayload {
  id: string;
  name: string;
  whatsapp: string;
  password?: string; // Optional - only if changing password
}

export interface GetUserParams {
  search?: string;
  role?: 'ADMIN' | 'KASIR';
  page?: number;
  limit?: number;
}

export const UserService = {
  /**
   * Get all users with optional filters
   */
  async get(payload?: GetUserParams): Promise<User[]> {
    try {
      const response = await api.get('/user/get-all', {
        params: payload,
        withCredentials: true
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  /**
   * Get a single user by ID
   */
  async getById(id: string): Promise<User> {
    try {
      const response = await api.get(`/user/${id}`, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  /**
   * Create a new user
   */
  async create(payload: CreateUserPayload): Promise<User> {
    try {
      const response = await api.post('/user/create', payload, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update an existing user
   */
  async update(payload: UpdateUserPayload): Promise<User> {
    try {
      // Remove password from payload if it's empty
      const cleanPayload = { ...payload };
      if (!cleanPayload.password || cleanPayload.password.trim() === '') {
        delete cleanPayload.password;
      }

      const response = await api.patch('/user/update', cleanPayload, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete a user by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete('/user/delete', {
        params: { id },
        withCredentials: true
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};