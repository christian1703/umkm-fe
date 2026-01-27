// app/service/password-service.ts
import { api } from "@/lib/api";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  success: boolean;
}

export const passwordService = {
  async changePassword(
    payload: ChangePasswordPayload
  ): Promise<ChangePasswordResponse> {
    try {
      const response = await api.post("/auth/change-password", payload);
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};