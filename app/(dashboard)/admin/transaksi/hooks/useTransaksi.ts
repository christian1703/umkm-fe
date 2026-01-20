import { useQuery } from '@tanstack/react-query';
import { transaksiService } from '../service/service';

export const useTransaksi = () => {
  return useQuery({
    queryKey: ['transaksi'],
    queryFn: transaksiService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};