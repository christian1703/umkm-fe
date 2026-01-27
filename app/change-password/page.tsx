// app/(auth)/change-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { AuthService } from "@/app/utils/auth";
import { api } from "@/lib/api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Password validation states
  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Check if user is authenticated and needs to change password
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await AuthService.getCurrentUser();
      
      if (!currentUser) {
        router.push("/login");
        return;
      }

      // If password already changed, redirect to dashboard
      if (currentUser.passwordChanged) {
        if (currentUser.role === "ADMIN") {
          router.push("/admin/home");
        } else {
          router.push("/kasir/transaksi");
        }
        return;
      }

      setUser(currentUser);
    };

    checkAuth();
  }, [router]);

  // Validate password strength
  useEffect(() => {
    if (newPassword) {
      setValidations({
        minLength: newPassword.length >= 8,
        hasUpperCase: /[A-Z]/.test(newPassword),
        hasLowerCase: /[a-z]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      });
    }
  }, [newPassword]);

  const isPasswordValid = () => {
    return Object.values(validations).every((v) => v === true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }

    if (!isPasswordValid()) {
      setError("Password baru tidak memenuhi kriteria keamanan");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Password baru tidak boleh sama dengan password lama");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      // Update user data in session storage
      if (user) {
        const updatedUser = { ...user, passwordChanged: true };
        sessionStorage.setItem("auth_user", JSON.stringify(updatedUser));
      }

      setSuccess("Password berhasil diubah! Anda akan dialihkan...");

      // Redirect after 2 seconds
      setTimeout(() => {
        if (user?.role === "ADMIN") {
          router.push("/admin/home");
        } else {
          router.push("/kasir/transaksi");
        }
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error("Change password error:", err);
      
      if (err.response?.status === 401) {
        setError("Password saat ini tidak valid");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push("/login");
    router.refresh();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Ubah Password
          </CardTitle>
          <CardDescription className="text-center">
            Untuk keamanan akun Anda, silakan ubah password default Anda
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Masukkan password saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Masukkan ulang password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Kriteria Password:
              </p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-2">
                  {validations.minLength ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-slate-400" />
                  )}
                  <span
                    className={
                      validations.minLength
                        ? "text-green-600"
                        : "text-slate-600 dark:text-slate-400"
                    }
                  >
                    Minimal 8 karakter
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {validations.hasUpperCase ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-slate-400" />
                  )}
                  <span
                    className={
                      validations.hasUpperCase
                        ? "text-green-600"
                        : "text-slate-600 dark:text-slate-400"
                    }
                  >
                    Minimal 1 huruf besar (A-Z)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {validations.hasLowerCase ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-slate-400" />
                  )}
                  <span
                    className={
                      validations.hasLowerCase
                        ? "text-green-600"
                        : "text-slate-600 dark:text-slate-400"
                    }
                  >
                    Minimal 1 huruf kecil (a-z)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {validations.hasNumber ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-slate-400" />
                  )}
                  <span
                    className={
                      validations.hasNumber
                        ? "text-green-600"
                        : "text-slate-600 dark:text-slate-400"
                    }
                  >
                    Minimal 1 angka (0-9)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {validations.hasSpecialChar ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-slate-400" />
                  )}
                  <span
                    className={
                      validations.hasSpecialChar
                        ? "text-green-600"
                        : "text-slate-600 dark:text-slate-400"
                    }
                  >
                    Minimal 1 karakter khusus (!@#$%^&*...)
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isPasswordValid()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ubah Password"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleLogout}
              disabled={isLoading}
            >
              Logout
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}