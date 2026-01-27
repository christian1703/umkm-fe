'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Save, User, Phone, Lock, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import { UpdateUserPayload, UserService } from '../manajemen-kasir/service/service';

export default function AdminPengaturanPage() {
  const { user, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 

  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    namaAdmin: '',
    nomorWA: '',
    password: '',
    confirmPassword: ''
  });

  // Load initial data from auth context
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        namaAdmin: user.name || '',
        nomorWA: user.whatsapp || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validateForm = (): string | null => {
    // Validasi nama admin
    if (!formData.namaAdmin || formData.namaAdmin.trim().length < 3) {
      return 'Nama admin minimal 3 karakter!';
    }

    // Validasi nomor WA
    if (!formData.nomorWA || formData.nomorWA.length < 10) {
      return 'Nomor WhatsApp tidak valid! Minimal 10 digit.';
    }

    // Validasi nomor WA hanya angka
    if (!/^\d+$/.test(formData.nomorWA)) {
      return 'Nomor WhatsApp hanya boleh berisi angka!';
    }

    // Validasi password jika diisi
    if (formData.password) {
      if (formData.password.length < 8) {
        return 'Password minimal 8 karakter!';
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Password dan konfirmasi password tidak cocok!';
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    // Validasi form
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!user?.id) {
      setErrorMessage('User ID tidak ditemukan!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Prepare payload
      const payload: UpdateUserPayload = {
        id: user.id,
        name: formData.namaAdmin.trim(),
        whatsapp: formData.nomorWA,
        password: formData.password || '' // Send empty string if no password change
      };

      // Call API
      await UserService.update(payload);

      // Refresh user data in auth context
      await refreshUser();

      setSuccessMessage('Pengaturan berhasil disimpan!');
      setIsEditing(false);

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating admin settings:', error);
      const message = error.response?.data?.message ||
        error.message ||
        'Gagal menyimpan pengaturan. Silakan coba lagi.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');

    // Reset to original values from user context
    if (user) {
      setFormData({
        username: user.username || '',
        namaAdmin: user.name || '',
        nomorWA: user.whatsapp || '',
        password: '',
        confirmPassword: ''
      });
    }
  };

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Pengaturan Admin</h1>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil Administrator</CardTitle>
          <CardDescription>
            Kelola informasi akun administrator dan keamanan sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Username - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Username tidak dapat diubah
              </p>
            </div>

            {/* Nama Admin */}
            <div className="space-y-2">
              <Label htmlFor="namaAdmin" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nama Admin
              </Label>
              <Input
                id="namaAdmin"
                name="namaAdmin"
                value={formData.namaAdmin}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Masukkan nama admin"
              />
              {isEditing && (
                <p className="text-xs text-gray-500">
                  Nama admin minimal 3 karakter
                </p>
              )}
            </div>

            {/* Nomor WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="nomorWA" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Nomor WhatsApp
              </Label>
              <Input
                id="nomorWA"
                name="nomorWA"
                value={formData.nomorWA}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="081234567890"
                type="tel"
              />
              {isEditing && (
                <p className="text-xs text-gray-500">
                  Format: 08xxxxxxxxxx (minimal 10 digit)
                </p>
              )}
            </div>

            {/* Divider */}
            {isEditing && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">
                  Ubah Password (Opsional)
                </h3>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500">
                  Password minimal 8 karakter untuk keamanan yang lebih baik
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Ulangi password baru"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Edit Profil Admin
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}