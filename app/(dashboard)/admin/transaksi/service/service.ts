// app/(dashboard)/admin/transaksi/services/transaksiService.ts
import { api } from '@/lib/api'; // Adjust path based on your API client location

export interface Transaction {
  id: string;
  type: 'PEMBELIAN' | 'PENARIKAN' | string;
  channel: string;
  transactionDate: string;
  amount: string;
  isDeleted: boolean;
  file: string;
}

export const transaksiService = {
  async getAll(): Promise<Transaction[]> {
    try {
      const response = await api.get('/transaksi/get-all');
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
};