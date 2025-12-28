// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/app/utils/auth";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    
    if (user) {
      // Redirect based on role
      if (user.role === "ADMIN") {
        router.push("/admin/home");
      } else {
        router.push("/kasir/transaksi");
      }
    } else {
      // Not logged in, go to login
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
    </div>
  );
}