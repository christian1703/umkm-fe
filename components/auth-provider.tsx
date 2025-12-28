// app/components/auth-provider.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthService } from "@/app/utils/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLoginPage = pathname === "/login";
    const isAuthenticated = AuthService.isAuthenticated();
    const user = AuthService.getCurrentUser();

    // If on login page and already authenticated, redirect to dashboard
    if (isLoginPage && isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.push("/admin/home");
      } else {
        router.push("/kasir/home");
      }
      return;
    }

    // If on protected route and not authenticated, redirect to login
    const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/kasir");
    if (isProtectedRoute && !isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Role-based access control
    if (isAuthenticated && user) {
      const isAdminRoute = pathname.startsWith("/admin");
      const isKasirRoute = pathname.startsWith("/kasir");

      // If kasir trying to access admin routes, redirect
      if (user.role === "KASIR" && isAdminRoute) {
        router.push("/kasir/home");
        return;
      }

      // Admin can access everything, no additional checks needed
    }
  }, [pathname, router]);

  return <>{children}</>;
}