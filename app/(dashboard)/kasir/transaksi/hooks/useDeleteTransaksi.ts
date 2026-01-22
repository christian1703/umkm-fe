import { useMutation } from '@tanstack/react-query';
import { transaksiKasirService } from '../service/service';

export const useDeleteTransaksi = () => {
  return useMutation({
    mutationFn: transaksiKasirService.delete,
  });
};
