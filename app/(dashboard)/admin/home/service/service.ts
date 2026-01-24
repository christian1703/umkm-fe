import { api } from '@/lib/api';

export interface DashboardData {
  totalNilai: number;
  totalFrekuensi: number;
  previousPeriodNilai: number;
  previousPeriodFrekuensi: number;
  averageTransactionValue: number;
  peakDay: string;
  combinedVolumeData: Array<{
    day: string;
    nilaiPemasukan: number;
    nilaiPengeluaran: number;
    frekuensiPemasukan: number;
    frekuensiPengeluaran: number;
  }>;
  transactionTypeData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  topChannels: Array<{
    channel: string;
    count: number;                    // total transactions (still used for sorting/ranking)
    pemasukanCount?: number;         // optional: if you also want split count
    pengeluaranCount?: number;
    pemasukanAmount: number;         // ← new
    pengeluaranAmount: number;       // ← new
    totalAmount?: number;            // optional: convenience field = pemasukan + pengeluaran
  }>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export interface DashboardPayload {
  timeFilter?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export const dashboardService = {
  async get(payload: DashboardPayload): Promise<DashboardResponse> {
    try {
      const response = await api.get('/dashboard/get-all', {
        params: payload
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};