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
  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    try {
      const response = await api.post('/transaksi/create', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
};