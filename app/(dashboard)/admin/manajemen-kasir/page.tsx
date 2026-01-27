"use client";

import { useState, useMemo } from "react";
import { CustomFilter, DataTable, Field } from "@/components/app-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useKasir } from "./hooks/useKasir";
import { UserService } from "./service/service";
import { toast } from "sonner";

export default function AdminKasirPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { userData, isLoading, error, refetch } = useKasir();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    whatsapp: "",
  });

 
  const dataWithNumber = useMemo(() => {
    return userData.map((user, index) => ({
      ...user,
      no: index + 1, 
    }));
  }, [userData]);

  const fields: Field[] = [
    { key: "no", label: "No", sortable: false }, 
    { key: "name", label: "Nama Kasir", sortable: true, filterable: true },
    { key: "username", label: "Username", filterable: true },
    { key: "whatsapp", label: "Nomor WhatsApp", filterable: true },
  ];

  const customFilters: CustomFilter[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      onFilterChange: (value) => {
        console.log("Custom filter changed:", value);
      },
    },
  ];

  const handleSubmitKasir = async () => {
    try {
      const res = await UserService.create({
        name: form.name,
        username: form.username,
        whatsapp: form.whatsapp,
        role: "KASIR"
      });

      toast.success("Berhasil Membuat Kasir")

      await refetch();

      setForm({ name: "", username: "", whatsapp: "" });
      setOpen(false);
    } catch (error: any) {
      console.error("Error creating kasir:", error);
      const errorMsg = error.response?.data?.error || "Gagal membuat kasir";
      toast.error(errorMsg)
    }
  };

  const handleDelete = async (row: any) => {

    try {
      await UserService.delete(row.id);
      toast.success("Berhasil Menghapus Kasir")
      await refetch();
    } catch (error: any) {
      console.error("Error deleting kasir:", error);
      const errorMsg = error.response?.data?.error || "Gagal menghapus kasir";
      toast.error(errorMsg)
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <>
      <DataTable
        headerName="Manajemen Kasir"
        fields={fields}
        data={dataWithNumber} 
        acl={{
          canView: false,
          canAdd: true,
          canUpdate: false,
          canDelete: true,
        }}
        actions={{
          onView: (row) => alert(`View: ${JSON.stringify(row)}`),
          onAdd: () => setOpen(true),
          onUpdate: (row) => alert(`Update: ${JSON.stringify(row)}`),
          onDelete: handleDelete,
        }}
        customFilters={customFilters}
        pagination={{
          currentPage,
          totalPages: Math.ceil(userData.length / pageSize),
          pageSize,
          totalItems: userData.length,
        }}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kasir</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nama Kasir</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Nomor WhatsApp</Label>
              <Input
                value={form.whatsapp}
                onChange={(e) =>
                  setForm({ ...form, whatsapp: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmitKasir}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}