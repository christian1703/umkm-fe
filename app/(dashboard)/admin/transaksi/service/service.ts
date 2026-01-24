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

export interface DetailTransaction {
  id: string,
  name: string,
  amount: number,
  quantity: number
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
  async getDetail(id: string): Promise<Transaction> {
    try {
      const response = await api.post('/transaksi/get-detail', { id });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
};

//untuk download transaksi
export const downloadTransaksiExcel = async () => {
  const res = await api.get("/transaksi/download-excel", {
    responseType: "blob",
  });

  // 1. Ambil header content-disposition
  const disposition = res.headers["content-disposition"];

  // 2. Default filename (fallback)
  let filename = "data-transaksi.xlsx";

  if (disposition) {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "");
    }
  }

  // 3. Buat blob
  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  // 4. Trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};
