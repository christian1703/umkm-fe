'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Save, User, Phone, Lock, Shield } from 'lucide-react';

export default function AdminPengaturanPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Data yang bisa diedit
  const [formData, setFormData] = useState({
    username: 'admin001',
    namaAdmin: 'John Doe',
    nomorWA: '081234567890',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccessMessage('');
  };

  const handleSubmit = () => {
    // Validasi username
    if (!formData.username || formData.username.trim().length < 4) {
      alert('Username minimal 4 karakter!');
      return;
    }
    
    // Validasi password jika diisi
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Password dan konfirmasi password tidak cocok!');
      return;
    }
    
    // Validasi nomor WA
    if (!formData.nomorWA || formData.nomorWA.length < 10) {
      alert('Nomor WhatsApp tidak valid!');
      return;
    }
    
    // Validasi nama admin
    if (!formData.namaAdmin || formData.namaAdmin.trim().length < 3) {
      alert('Nama admin minimal 3 karakter!');
      return;
    }
    
    // Simpan data (dalam implementasi nyata, kirim ke backend)
    console.log('Data yang disimpan:', {
      username: formData.username,
      namaAdmin: formData.namaAdmin,
      nomorWA: formData.nomorWA,
      ...(formData.password && { password: formData.password })
    });
    
    setSuccessMessage('Pengaturan berhasil disimpan!');
    setIsEditing(false);
    
    // Reset password fields
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
    
    // Hapus pesan sukses setelah 3 detik
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: 'admin001',
      namaAdmin: 'John Doe',
      nomorWA: '081234567890',
      password: '',
      confirmPassword: ''
    });
    setSuccessMessage('');
  };

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
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil Administrator</CardTitle>
          <CardDescription>
            Kelola informasi akun administrator dan keamanan sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Username - Editable untuk Admin */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Masukkan username"
              />
              {isEditing && (
                <p className="text-xs text-gray-500">
                  Username minimal 4 karakter
                </p>
              )}
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
            </div>

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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  disabled={!isEditing}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  disabled={!isEditing}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
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