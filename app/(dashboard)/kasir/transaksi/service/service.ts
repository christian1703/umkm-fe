import { api } from '@/lib/api';
import { DetailTransaction, Transaction } from "@/app/(dashboard)/admin/transaksi/service/service";

interface CreateTransactionPayload {
  type: string;
  channel: string;
  transactionDate: string;
  amount: number;
  file: string;
  detail: DetailTransaction[];
}

export const transaksiKasirService = {
  async create(payload: any): Promise<Transaction> {
    try {
      const response = await api.post('/transaksi/create', payload,  {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },
  async delete(id:string): Promise<string> {
    try {
      const response = await api.post('/transaksi/delete', {id});
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

};