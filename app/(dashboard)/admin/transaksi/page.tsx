"use client";

import { useState } from "react";
import { DataTable, Field } from "@/components/app-table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppListView from "@/components/app-list-view";

import { useTransaksi } from "./hooks/useTransaksi";
import { useDetailTransaksi } from "./hooks/useDetailTransaksi";
import { IMAGE_BASE_URL, isProd } from "@/lib/constants";
import Image from "next/image";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { downloadTransaksiExcel } from "./service/service";

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
          onDownload: async () => {
            await downloadTransaksiExcel()
          }
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


            <Card className="w-full max-w-sm border-0">
              <CardContent className="p-2">
                <Collapsible className="space-y-2" defaultOpen>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-3 text-left font-medium transition-all hover:from-teal-100 hover:to-blue-100 data-[state=open]:rounded-b-none">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-gray-700">Attachment File</span>
                    </div>
                    <svg className="h-5 w-5 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="overflow-hidden rounded-b-lg border border-t-0 border-gray-100 bg-white data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="p-4">
                      <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                        <Image
                          src={`${IMAGE_BASE_URL}/${detailData?.file}`}
                          alt="Attachment preview"
                          width={250}
                          height={500}
                          unoptimized={!isProd}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

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
