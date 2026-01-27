import { api } from '@/lib/api';

export interface User {
  id: string;
  name: string; 
  username: string;
  whatsapp: string;
  role?: string;
}

export interface CreateUserPayload {
  name: string; 
  username: string;
  whatsapp: string;
  role?: string;
}

export const UserService = {
  async get(payload: any): Promise<User[]> {
    try {
      const response = await api.get('/user/get-all', {
        params: payload
      });
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  async create(payload: CreateUserPayload): Promise<User> {
    try {
      const response = await api.post('/user/create', payload);
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/user/delete`, { params: { id } });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};