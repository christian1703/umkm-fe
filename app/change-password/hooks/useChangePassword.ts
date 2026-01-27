// app/hooks/useChangePassword.ts
import { useMutation } from '@tanstack/react-query';
import { ChangePasswordPayload, passwordService } from '../service/service';

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) =>
            passwordService.changePassword(payload),
    });
};