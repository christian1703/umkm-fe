"use client";

import { useState } from "react";
import { DataTable, Field } from "@/components/app-table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppListView from "@/components/app-list-view";

import { useTransaksi } from "./hooks/useTransaksi";
import { useDetailTransaksi } from "./hooks/useDetailTransaksi";

export default function AdminTransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openView, setOpenView] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const { data, isLoading, error } = useTransaksi();

  const selectedId = selectedRow?.id;

  const {
    data: detailData,
    isLoading: isDetailLoading,
    error: detailError,
  } = useDetailTransaksi(selectedId);

  const renderBadge = (value: string): React.ReactNode => {
    if (value === "PEMASUKAN") {
      return <Badge className="bg-green-500">{value}</Badge>;
    }
    if (value === "PENGELUARAN") {
      return <Badge variant="destructive">{value}</Badge>;
    }
    return <Badge>{value}</Badge>;
  };

  const fields: Field[] = [
    { key: "id", label: "ID", sortable: true, visible: false },
    {
      key: "transactionDate",
      label: "Tanggal Transaksi",
      filterable: false,
      type: "date",
    },
    {
      key: "type",
      label: "Jenis Transaksi",
      filterable: false,
      render: (value) => renderBadge(value),
    },
    {
      key: "channel",
      label: "Channel",
      filterable: false,
      render: (value) => renderBadge(value),
    },  
    { key: "amount", label: "Nominal", sortable: true, type: "amount" },
    { key: "file", label: "Lampiran" },
  ];

  const detailTrxFields: Field[] = [
    {
      key: "name",
      label: "Nama",
      filterable: false,
    },
    {
      key: "amount",
      label: "Nominal",
      type: 'amount',
      filterable: false,
    },
    {
      key: "quantity",
      label: "Jumlah",
      filterable: false,
    },

  ];

  const handleView = (row: any) => {
    setSelectedRow(row);
    setOpenView(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Error loading transactions: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <>
      <DataTable
        headerName="Data Transaksi"
        fields={fields}
        data={data || []}
        acl={{
          canView: true,
          canAdd: false,
          canUpdate: false,
          canDelete: false,
          canDownload: true,

        }}
        actions={{
          onView: handleView,
        }}
        pagination={{
          currentPage,
          totalPages: 3,
          pageSize,
          totalItems: 25,
        }}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-5xl p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Transaction Detail</DialogTitle>
          </DialogHeader>

          {/* SCROLL AREA */}
          <div className="px-6 py-4 max-h-[80vh] overflow-auto space-y-6">
            {detailData && <AppListView data={detailData} blacklist={['detail', 'isDeleted']} />}

            <DataTable
              data={detailData?.detail || []}
              fields={detailTrxFields}
              headerName="Detail Transaksi"
              acl={{
                canView: false,
                canAdd: false,
                canUpdate: false,
                canDelete: false,
                canDownload: false,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
