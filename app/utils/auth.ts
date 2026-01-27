// app/utils/auth.ts
import { LoginResponse, loginService } from "../(auth)/login/service/service"; // adjust path if needed
import { api } from "@/lib/api";

export type User = {
  id: string;
  username: string;
  name: string;
  whatsapp: string; // Added whatsapp field
  role: "ADMIN" | "KASIR";
  passwordChanged: boolean;
};

export class AuthService {
  private static USER_KEY = "auth_user_data";

  static async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await loginService.login({ username, password });
      const user: User = {
        id: response.user.id,
        username: response.user.username,
        name: response.user.name,
        whatsapp: response.user.whatsapp || '', // Add whatsapp from response
        role: response.user.role,
        passwordChanged: response.user.passwordChanged,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }

      return { success: true, user };
    } catch (error: any) {
      console.error("Login failed:", error);
      const message =
        error.response?.data?.message ||
        (error.response?.status === 401 ? "Username atau password salah" : "Login gagal");

      return { success: false, error: message };
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("Logout API failed:", err);
    } finally {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(this.USER_KEY);
      }
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      await api.get("/auth/me", { withCredentials: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns the current user, preferring cached value for speed,
   * but verifies with /me in background if possible.
   */
  static async getCurrentUser(
    options?: { force?: boolean }
  ): Promise<User | null> {
    if (typeof window === "undefined") return null;

    const force = options?.force === true;

    // 1️⃣ USE CACHE ONLY IF NOT FORCED
    if (!force) {
      const cached = sessionStorage.getItem(this.USER_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as User;
          if (parsed.id && parsed.role && ["ADMIN", "KASIR"].includes(parsed.role)) {
            // background sync
            this._verifyAndUpdateInBackground();
            return parsed;
          }
        } catch {
          sessionStorage.removeItem(this.USER_KEY);
        }
      }
    }

    // 2️⃣ FORCE OR NO CACHE → FETCH FROM API
    try {
      const res = await api.get("/auth/me", {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const userData = res.data?.user;
      if (!userData) {
        sessionStorage.removeItem(this.USER_KEY);
        return null;
      }

      const user: User = {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        whatsapp: userData.whatsapp || "",
        role: userData.role,
        passwordChanged: userData.passwordChanged ?? true,
      };

      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      console.log("getCurrentUser failed", err);
      sessionStorage.removeItem(this.USER_KEY);
      return null;
    }
  }


  /**
   * Background verification to keep cache in sync
   */
  private static async _verifyAndUpdateInBackground(): Promise<void> {
    try {
      const res = await api.get("/auth/me", { withCredentials: true });
      const data = res.data;

      // The API returns { success: true, user: {...} }
      const userData = data.user;

      if (!userData) {
        console.warn("No user data in background verification");
        sessionStorage.removeItem(this.USER_KEY);
        return;
      }

      const user: User = {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        whatsapp: userData.whatsapp || '', // Add whatsapp field
        role: userData.role,
        passwordChanged: userData.passwordChanged ?? true,
      };

      // Validate before updating
      if (user.id && user.username && user.role) {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
    } catch (err) {
      console.warn("Background user verification failed", err);
      // If verification fails, clear the cache
      sessionStorage.removeItem(this.USER_KEY);
    }
  }

  static async hasRole(requiredRole: "ADMIN" | "KASIR"): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return user.role === requiredRole;
  }
}