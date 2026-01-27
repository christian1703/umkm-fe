import { useMutation } from '@tanstack/react-query';
import { loginService } from '../service/service';

export const useLogin = () => {
  return useMutation({
    mutationFn: loginService.login,
  });
};
