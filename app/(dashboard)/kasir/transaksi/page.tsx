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
import { getNowDateTimeLocal } from "@/app/utils/date";

type DialogMode = "view" | "add" | null;

interface DetailRow {
  id: string;
  name: string;
  quantity: string;
  amount: string;
}

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
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
    });
    setDetailRows([{ id: crypto.randomUUID(), name: "", quantity: "", amount: "" }]);
    setSelectedFile(null);
    setFilePreview(null);
    setDialogMode("add");
  };

  const handleView = (row: any) => {
    setSelectedRow(row);
    setDialogMode("view");
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setSelectedRow(null);
    setSelectedFile(null);
    setFilePreview(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: size limit (example: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      e.target.value = "";
      return;
    }

    // Optional: only allow images
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan (jpg, jpeg, png)");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* ===============================
   * SUBMIT
   * =============================== */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = new FormData();

      payload.append("type", formData.type);
      payload.append("channel", formData.channel);
      payload.append("transactionDate", new Date(formData.transactionDate).toISOString());
      payload.append("amount", totalAmount.toString());

      if (selectedFile) {
        payload.append("file", selectedFile);
      }

      payload.append(
        "detail",
        JSON.stringify(
          detailRows.map((d) => ({
            id: "",
            name: d.name,
            quantity: Number(d.quantity),
            amount: Number(d.amount),
          }))
        )
      );

      await transaksiKasirService.create(payload);

      toast.success("Transaksi berhasil dibuat");
      handleCloseDialog();
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal membuat transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (data: any) => {
    const { id } = data;
    if (!id) return false;

    try {
      await transaksiKasirService.delete(id);
      toast.success(`Berhasil menghapus transaksi ${id}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus transaksi");
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
    { key: "id", label: "ID", visible: false },
    { key: "transactionDate", label: "Tanggal", type: "date", sortable: true },
    { key: "type", label: "Jenis", render: renderBadge },
    { key: "channel", label: "Channel" },
    { key: "amount", label: "Nominal", type: "amount" },
    { key: "file", label: "Lampiran", type: "text" },
  ];

  return (
    <>
      <DataTable
        headerName="Data Transaksi"
        fields={fields}
        data={data || []}
        acl={{ canView: true, canAdd: true, canDelete: true }}
        actions={{ onAdd: handleAdd, onView: handleView, onDelete: handleDelete }}
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

            {/* File Upload Field */}
            <div className="col-span-2">
              <Label>Lampiran (jpg, jpeg, png)</Label>
              <div className="mt-1.5">
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Terpilih: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {filePreview && (
                <div className="mt-4">
                  <div className="relative w-40 h-40 border rounded-md overflow-hidden bg-muted/40">
                    <img
                      src={filePreview}
                      alt="Preview lampiran"
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}
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