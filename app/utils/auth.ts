// app/utils/auth.ts
import { AppRole } from "./role";

export type User = {
  id: string;
  username: string;
  role: AppRole;
};

// Dummy users for testing
const DUMMY_USERS = [
  { id: "1", username: "admin", password: "admin123", role: "ADMIN" as AppRole },
  { id: "2", username: "kasir", password: "kasir123", role: "KASIR" as AppRole },
];

export class AuthService {
  private static TOKEN_KEY = "auth_token";
  private static USER_KEY = "auth_user";

  // Login function
  static async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = DUMMY_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return { success: false, error: "Username atau password salah" };
    }

    // Create a simple token (in real app, this comes from backend)
    const token = btoa(JSON.stringify({ id: user.id, timestamp: Date.now() }));
    
    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
      }));
      
      // Also set cookie for middleware (expires in 7 days)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      document.cookie = `auth_token=${token}; path=/; expires=${expiryDate.toUTCString()}`;
    }

    return { 
      success: true, 
      user: { id: user.id, username: user.username, role: user.role } 
    };
  }

  // Logout function
  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      
      // Remove cookie
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Get current user
  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Get token
  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Check if user has required role
  static hasRole(requiredRole: AppRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === "ADMIN") return true;
    
    return user.role === requiredRole;
  }
}