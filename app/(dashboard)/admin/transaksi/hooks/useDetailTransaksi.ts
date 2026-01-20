import { useQuery } from '@tanstack/react-query';
import { transaksiService } from '../service/service';

export const useDetailTransaksi = (id:string) => {
  return useQuery({
    queryKey: ['detailTransaksi',id],
    queryFn: ()=>transaksiService.getDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};