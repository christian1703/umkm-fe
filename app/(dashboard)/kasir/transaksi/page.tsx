"use client";

import { useMemo, useState } from "react";
import { DataTable, Field } from "@/components/app-table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppListView from "@/components/app-list-view";
import { useDetailTransaksi } from "../../admin/transaksi/hooks/useDetailTransaksi";
import { useTransaksi } from "../../admin/transaksi/hooks/useTransaksi";
import { Trash2, Plus } from "lucide-react";
import { formatIDR, parseIDR } from "@/app/utils/idr-format";
import { toast } from "sonner";
import { transaksiKasirService } from "./service/service";

type DialogMode = "view" | "add" | null;

interface DetailRow {
  id: string;
  name: string;
  quantity: string;
  amount: string;
}

/* ===============================
 * HELPER
 * =============================== */
const getNowDateTimeLocal = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export default function KasirTransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    transactionDate: getNowDateTimeLocal(),
    channel: "",
    file: "",
  });

  const [detailRows, setDetailRows] = useState<DetailRow[]>([
    { id: crypto.randomUUID(), name: "", quantity: "", amount: "" },
  ]);

  const { data, refetch } = useTransaksi();
  const selectedId = selectedRow?.id;
  const { data: detailData } = useDetailTransaksi(selectedId);

  /* ===============================
   * TOTAL (AUTO CALCULATED)
   * =============================== */
  const totalAmount = useMemo(() => {
    return detailRows.reduce((sum, row) => {
      return sum + Number(row.quantity || 0) * Number(row.amount || 0);
    }, 0);
  }, [detailRows]);

  /* ===============================
   * VALIDATION
   * =============================== */
  const validateForm = () => {
    if (!formData.type) return toast.error("Jenis transaksi wajib dipilih"), false;
    if (!formData.channel) return toast.error("Channel wajib dipilih"), false;
    if (!formData.transactionDate)
      return toast.error("Tanggal transaksi wajib diisi"), false;

    if (detailRows.length === 0)
      return toast.error("Minimal 1 detail transaksi"), false;

    for (const row of detailRows) {
      if (!row.name)
        return toast.error("Nama detail transaksi tidak boleh kosong"), false;
      if (Number(row.quantity) <= 0)
        return toast.error("Quantity harus lebih dari 0"), false;
      if (Number(row.amount) <= 0)
        return toast.error("Nominal harus lebih dari 0"), false;
    }

    if (totalAmount <= 0)
      return toast.error("Total transaksi tidak valid"), false;

    return true;
  };

  /* ===============================
   * HANDLERS
   * =============================== */
  const handleAdd = () => {
    setFormData({
      type: "PEMASUKAN",
      transactionDate: getNowDateTimeLocal(),
      channel: "CASH",
      file: "",
    });
    setDetailRows([{ id: crypto.randomUUID(), name: "", quantity: "", amount: "" }]);
    setDialogMode("add");
  };

  const handleView = (row: any) => {
    setSelectedRow(row);
    setDialogMode("view");
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setSelectedRow(null);
  };

  const handleDetailRowChange = (
    id: string,
    field: keyof DetailRow,
    value: string
  ) => {
    setDetailRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleAddDetailRow = () => {
    setDetailRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", quantity: "", amount: "" },
    ]);
  };

  const handleRemoveDetailRow = (id: string) => {
    if (detailRows.length === 1) return;
    setDetailRows((prev) => prev.filter((row) => row.id !== id));
  };

  /* ===============================
   * SUBMIT
   * =============================== */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await transaksiKasirService.create({
        type: formData.type,
        channel: formData.channel,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        amount: totalAmount,
        file: formData.file,
        detail: detailRows.map((d) => ({
          id: "",
          name: d.name,
          quantity: Number(d.quantity),
          amount: Number(d.amount),
        })),
      });

      toast.success("Transaksi berhasil dibuat");
      handleCloseDialog();
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal membuat transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===============================
   * TABLE CONFIG
   * =============================== */
  const renderBadge = (value: string) => {
    if (value === "PEMASUKAN")
      return <Badge className="bg-green-500">{value}</Badge>;
    if (value === "PENGELUARAN")
      return <Badge variant="destructive">{value}</Badge>;
    return <Badge>{value}</Badge>;
  };

  const fields: Field[] = [
    { key: "id", label: "ID" },
    { key: "type", label: "Jenis", render: renderBadge },
    { key: "transactionDate", label: "Tanggal", type: "date" },
    { key: "channel", label: "Channel" },
    { key: "amount", label: "Nominal", type: "amount" },
  ];

  return (
    <>
      <DataTable
        headerName="Data Transaksi"
        fields={fields}
        data={data || []}
        acl={{ canView: true, canAdd: true }}
        actions={{ onAdd: handleAdd, onView: handleView }}
        pagination={{
          currentPage,
          totalPages: 1,
          pageSize,
          totalItems: data?.length || 0,
        }}
      />

      {/* ADD DIALOG */}
      <Dialog open={dialogMode === "add"} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
          </DialogHeader>

          {/* HEADER FORM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Jenis Transaksi</Label>
              <select
                className="w-full h-10 border rounded-md px-3"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="">Pilih</option>
                <option value="PEMASUKAN">PEMASUKAN</option>
                <option value="PENGELUARAN">PENGELUARAN</option>
              </select>
            </div>

            <div>
              <Label>Channel</Label>
              <select
                className="w-full h-10 border rounded-md px-3"
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value })
                }
              >
                <option value="">Pilih</option>
                <option value="CASH">CASH</option>
                <option value="QRIS">QRIS</option>
                <option value="TRANSFER-BANK">TRANSFER BANK</option>
              </select>
            </div>

            <div>
              <Label>Tanggal</Label>
              <Input
                type="datetime-local"
                value={formData.transactionDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transactionDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Total Nominal</Label>
              <Input readOnly value={formatIDR(totalAmount)} />
            </div>
          </div>

          {/* DETAIL */}
          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center">
              <Label className="font-semibold">Detail Transaksi</Label>
              <Button size="sm" onClick={handleAddDetailRow}>
                <Plus className="h-4 w-4 mr-1" /> Tambah
              </Button>
            </div>

            <table className="w-full border rounded-lg">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2">Nama</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Nominal</th>
                  <th className="p-2 w-14"></th>
                </tr>
              </thead>
              <tbody>
                {detailRows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-2">
                      <Input
                        value={row.name}
                        onChange={(e) =>
                          handleDetailRowChange(row.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          handleDetailRowChange(
                            row.id,
                            "quantity",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={formatIDR(row.amount)}
                        onChange={(e) =>
                          handleDetailRowChange(
                            row.id,
                            "amount",
                            parseIDR(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={detailRows.length === 1}
                        onClick={() => handleRemoveDetailRow(row.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={dialogMode === "view"} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-5xl p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 max-h-[80vh] overflow-auto space-y-6">
            {detailData && (
              <AppListView
                data={detailData}
                blacklist={["detail", "isDeleted"]}
              />
            )}

            <DataTable
              headerName="Detail Transaksi"
              data={detailData?.detail || []}
              fields={[
                { key: "name", label: "Nama" },
                { key: "quantity", label: "Qty" },
                { key: "amount", label: "Nominal", type: "amount" },
              ]}
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
