import { api } from '@/lib/api';

export interface Transaction {
  id: string;
  type: 'PEMBELIAN' | 'PENARIKAN' | string;
  channel: string;
  transactionDate: string;
  amount: string;
  isDeleted: boolean;
  file: string;
  detail?: DetailTransaction[];
}

export interface DetailTransaction{
  id: string,
  name: string,
  amount:number,
  quantity:number
}

export const transaksiService = {
  async getAll(): Promise<Transaction[]> {
    try {
      const response = await api.post('/transaksi/get-all');
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
  async getDetail(id:string): Promise<Transaction> {
    try {
      const response = await api.post('/transaksi/get-detail', {id});
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
};