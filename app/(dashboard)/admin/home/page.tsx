"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity } from "lucide-react";

// Data dummy untuk simulasi
const generateDailyData = () => {
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  return days.map((day, idx) => ({
    day,
    nilai: Math.floor(Math.random() * 50000000) + 10000000,
    frekuensi: Math.floor(Math.random() * 500) + 100,
  }));
};

const generateWeeklyData = () => {
  const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
  return weeks.map((week) => ({
    day: week,
    nilai: Math.floor(Math.random() * 200000000) + 50000000,
    frekuensi: Math.floor(Math.random() * 2000) + 500,
  }));
};

const generateMonthlyData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
  return months.map((month) => ({
    day: month,
    nilai: Math.floor(Math.random() * 500000000) + 100000000,
    frekuensi: Math.floor(Math.random() * 5000) + 1000,
  }));
};

const transactionTypeData = [
  { name: "Pemasukan", value: 90, color: "#3b82f6" },
  { name: "Pengeluaran", value: 30, color: "#10b981" },

];

export default function AdminDashboardPage() {
  const [nilaiTimeFilter, setNilaiTimeFilter] = useState("daily");
  const [frekuensiTimeFilter, setFrekuensiTimeFilter] = useState("daily");

  const nilaiVolumeData = useMemo(() => {
    switch (nilaiTimeFilter) {
      case "weekly":
        return generateWeeklyData();
      case "monthly":
        return generateMonthlyData();
      default:
        return generateDailyData();
    }
  }, [nilaiTimeFilter]);

  const frekuensiVolumeData = useMemo(() => {
    switch (frekuensiTimeFilter) {
      case "weekly":
        return generateWeeklyData();
      case "monthly":
        return generateMonthlyData();
      default:
        return generateDailyData();
    }
  }, [frekuensiTimeFilter]);

  const totalNilai = nilaiVolumeData.reduce((sum, item) => sum + item.nilai, 0);
  const totalFrekuensi = frekuensiVolumeData.reduce((sum, item) => sum + item.frekuensi, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
      </div>

      {/* Panel Angka */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Nilai Transaksi
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalNilai)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Periode {nilaiTimeFilter === "daily" ? "Harian" : nilaiTimeFilter === "weekly" ? "Mingguan" : "Bulanan"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Frekuensi Transaksi
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(totalFrekuensi)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Transaksi {frekuensiTimeFilter === "daily" ? "Hari Ini" : frekuensiTimeFilter === "weekly" ? "Minggu Ini" : "Bulan Ini"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Charts dan Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Chart - Nilai Transaksi */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Nilai Transaksi</CardTitle>
                <CardDescription>Trend nilai transaksi</CardDescription>
              </div>
              <Select value={nilaiTimeFilter} onValueChange={setNilaiTimeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={nilaiVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis 
                  stroke="#6b7280" 
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="nilai" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume Chart - Frekuensi Transaksi */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Frekuensi Transaksi</CardTitle>
                <CardDescription>Jumlah transaksi</CardDescription>
              </div>
              <Select value={frekuensiTimeFilter} onValueChange={setFrekuensiTimeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={frekuensiVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip 
                  formatter={(value) => `${formatNumber(value)} transaksi`}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="frekuensi" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Jenis Transaksi */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Jenis Transaksi</CardTitle>
            <CardDescription>Distribusi tipe transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={transactionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {transactionTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}