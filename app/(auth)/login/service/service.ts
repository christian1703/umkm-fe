// app/service/service.ts
import { api } from "@/lib/api";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    whatsapp: string;
    role: "KASIR" | "ADMIN";
    passwordChanged: boolean;
  };
}

export const loginService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/login", payload);
      return response.data;
    } catch (error) {
      console.error("Error login:", error);
      throw error;
    }
  },
};