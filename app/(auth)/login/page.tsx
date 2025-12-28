// app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { AuthService } from "@/app/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const user = AuthService.getCurrentUser();
      
      if (user) {
        // Already logged in, redirect to appropriate dashboard
        if (user.role === "ADMIN") {
          router.push("/admin/home");
        } else {
          router.push("/kasir/home");
        }
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await AuthService.login(username, password);

      if (result.success && result.user) {
        router.push('/')
        router.refresh();
      } else {
        setError(result.error || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:from-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            CatatTrans UMKM
          </CardTitle>
          <CardDescription className="text-center">
            Masuk ke akun Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <div>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 p-3 rounded-md space-y-1">
              <p className="font-semibold">Demo Credentials:</p>
              <p>Admin: admin / admin123</p>
              <p>Kasir: kasir / kasir123</p>
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              onClick={handleSubmit}
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}