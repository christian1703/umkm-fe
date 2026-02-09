"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComposedChart, Line, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, LineChart } from "recharts";
import { TrendingUp, Activity, DollarSign, ArrowUpRight, ArrowDownRight, Calendar, Loader2 } from "lucide-react";
import { useDashboardData } from "./hooks/useDashboard";
import { DataTable, Field } from "@/components/app-table";

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = useState<'today' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | any>("today");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Separate state for applied custom dates
  const [appliedStartDate, setAppliedStartDate] = useState(startDate);
  const [appliedEndDate, setAppliedEndDate] = useState(endDate);

  const { dashboardData, isLoading, error, refetch } = useDashboardData({
    ...(timeFilter === 'custom' ? { startDate: appliedStartDate, endDate: appliedEndDate } : {}),
  });

  const handleCustomDateSubmit = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  // Get period description based on filter
  const getPeriodDescription = () => {
    switch (timeFilter) {
      case 'today':
        return 'hari ini';
      case 'daily':
        return '7 hari terakhir';
      case 'weekly':
        return '4 minggu terakhir';
      case 'monthly':
        return '6 bulan terakhir';
      case 'yearly':
        return '12 bulan terakhir';
      case 'custom':
        return `${appliedStartDate} sampai ${appliedEndDate}`;
      default:
        return 'periode ini';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-medium">Gagal memuat data dashboard</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const {
    totalNilai,
    totalFrekuensi,
    previousPeriodNilai,
    previousPeriodFrekuensi,
    averageTransactionValue,
    peakDay,
    combinedVolumeData,
    transactionTypeData,
    topChannels
  } = dashboardData;

  const nilaiGrowth = calculateGrowth(totalNilai, previousPeriodNilai);
  const frekuensiGrowth = calculateGrowth(totalFrekuensi, previousPeriodFrekuensi);

  const channelFields: Field[] = [
    { key: "channel", label: "Channel", sortable: true, visible: true },
    { key: "count", label: "Frequency", sortable: true, visible: true },
    { key: "pemasukanAmount", label: "Pemasukan", type: "amount", sortable: true, visible: true },
    { key: "pemasukanCount", label: "Frekuensi Pemasukan", type: "number", sortable: true, visible: true },
    { key: "pengeluaranAmount", label: "Pengeluaran", type: "amount", sortable: true, visible: true },
    { key: "pengeluaranCount", label: "Frekuensi Pengeluaran", type: "number", sortable: true, visible: true },
    { key: "totalAmount", label: "Total", type: "amount", sortable: true, visible: true },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Ringkasan performa transaksi {getPeriodDescription()}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="daily">7 Hari (Daily)</SelectItem>
              <SelectItem value="weekly">4 Minggu (Weekly)</SelectItem>
              <SelectItem value="monthly">6 Bulan (Monthly)</SelectItem>
              <SelectItem value="yearly">12 Bulan (Yearly)</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          {timeFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Mulai:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Selesai:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={handleCustomDateSubmit}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition whitespace-nowrap"
              >
                Terapkan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Nilai Transaksi</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalNilai)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {nilaiGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${nilaiGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(nilaiGrowth).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs periode sebelumnya</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Frekuensi</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(totalFrekuensi)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {frekuensiGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${frekuensiGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(frekuensiGrowth).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">transaksi</span>
            </div>
          </CardContent>
        </Card>

        {timeFilter !== 'today' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(averageTransactionValue)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Per transaksi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waktu Tersibuk</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {peakDay}
                </div>
                <p className="text-xs text-gray-500 mt-1">Volume transaksi tertinggi</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Combined Chart - Nilai & Frekuensi */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trend Transaksi</CardTitle>
                <CardDescription>
                  {timeFilter === 'today'
                    ? 'Nilai dan frekuensi transaksi hari ini'
                    : 'Nilai (bar) dan frekuensi (line) pemasukan vs pengeluaran'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            {/* Chart 1: Nilai - Stacked Bar with positive/negative */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Nilai Transaksi (IDR)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={combinedVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#3b82f6"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => {
                      const abs = Math.abs(value);
                      if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)} jt`;
                      if (abs >= 1000) return `${(abs / 1000).toFixed(0)} rb`;
                      return abs.toString();
                    }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCurrency(Math.abs(value)), name]}
                    labelFormatter={(label) => `Periode: ${label}`}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="nilaiPemasukan"
                    name="Pemasukan"
                    fill="#10b981"
                    stackId="nilai"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="nilaiPengeluaran"
                    name="Pengeluaran"
                    fill="#ef4444"
                    stackId="nilai"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Frekuensi - Dual Line */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Frekuensi Transaksi</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={combinedVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), ""]}
                    labelFormatter={(label) => `Periode: ${label}`}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="frekuensiPemasukan"
                    name="Pemasukan"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="frekuensiPengeluaran"
                    name="Pengeluaran"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Jenis Transaksi */}
        <Card>
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
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `${value}%`}
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

      {/* Top Channels by Transaction Count */}
      <Card>
        <CardHeader>
          <CardTitle>Top Channel berdasarkan Frekuensi Transaksi</CardTitle>
          <CardDescription>Performa setiap channel</CardDescription>
        </CardHeader>
        <CardContent>
          {
            topChannels &&
            <DataTable
              data={topChannels}
              headerName="Top Channel"
              fields={channelFields}
              acl={
                {
                  canAdd: false,
                  canView: true
                }
              }>
            </DataTable>
          }
        </CardContent>
      </Card>
    </div>
  );
}