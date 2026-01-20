"use client"

import { CustomFilter, DataTable, Field } from "@/components/app-table"
import { useState } from "react";

export default function AdminTransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sampleData = [
    { 
      id: 1, 
      jenis_transaksi: 'Penjualan', 
      channel: 'QRIS',
      nominal: 'Rp 20.000',
      tanggal: '1 Januari 2026',
      lampiran: 'invoice_001.pdf'
    },
    { 
      id: 2, 
      jenis_transaksi: 'Pembelian', 
      channel: 'TUNAI',
      nominal: 'Rp 40.000',
      tanggal: '4 Januari 2026',
      lampiran: 'receipt_002.pdf'
    },
  ];

  const fields: Field[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'jenis_transaksi', label: 'Jenis Transaksi', filterable: true },
    { key: 'channel', label: 'Channel', filterable: true },
    { key: 'nominal', label: 'Nominal', sortable: true },
    { key: 'tanggal', label: 'Tanggal', sortable: true },
    { key: 'lampiran', label: 'Lampiran' },
  ];
  
  return (
    <DataTable
      headerName="Data Transaksi"
      fields={fields}
      data={sampleData}
      acl={{
        canView: true,
        canAdd: false,
        canUpdate: false,
        canDelete: false,
        canDownload:true,
      }}
      actions={{
        onView: (row) => alert(`View: ${JSON.stringify(row)}`),
      }}
      pagination={{
        currentPage,
        totalPages: 3,
        pageSize,
        totalItems: 25,
      }}
      onPageChange={(page) => {
        setCurrentPage(page);
        console.log('Page changed to:', page);
      }}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setCurrentPage(1);
        console.log('Page size changed to:', size);
      }}
    />
  )
}