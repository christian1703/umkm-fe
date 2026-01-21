import { useMutation } from '@tanstack/react-query';
import { transaksiKasirService } from '../service/service';

export const useCreateTransaksi = () => {
  return useMutation({
    mutationFn: transaksiKasirService.create,
  });
};
