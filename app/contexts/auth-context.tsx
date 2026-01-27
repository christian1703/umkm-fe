// components/auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthService, User } from "@/app/utils/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isInitialized = useRef(false);

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await AuthService.getCurrentUser({ force: true });
      setUser(currentUser);
      console.log(currentUser, "AFTER FETCHED")
      return;
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  // Initial authentication check - runs once on mount
  useEffect(() => {
    if (isInitialized.current) return;

    const initAuth = async () => {
      await refreshUser();
      isInitialized.current = true;
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Route protection - runs when pathname or user changes
  useEffect(() => {
    // Don't run protection logic until initialization is complete
    if (!isInitialized.current) return;

    const isLogin = pathname === "/login";
    const isChangePassword = pathname === "/change-password";
    const isProtected = pathname.startsWith("/admin/") || pathname.startsWith("/kasir/");

    // Redirect authenticated users away from login page
    if (isLogin && user) {
      const dest = user.role === "ADMIN" ? "/admin/home" : "/kasir/transaksi";
      router.replace(dest);
      return;
    }

    // Redirect unauthenticated users to login
    if (isProtected && !user) {
      const from = encodeURIComponent(pathname);
      router.replace(`/login?from=${from}`);
      return;
    }

    // Role-based access control
    if (user && isProtected) {
      const isAdminRoute = pathname.startsWith("/admin/");
      const isKasirRoute = pathname.startsWith("/kasir/");

      if (isAdminRoute && user.role !== "ADMIN") {
        router.replace("/kasir/transaksi");
      } else if (isKasirRoute && user.role === "ADMIN") {
        router.replace("/admin/home");
      }
    }
  }, [pathname, user, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}