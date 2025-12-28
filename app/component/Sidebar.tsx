"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className={"sidebar"}>
      <div className={"logo"}>
        <strong>CatatTrans</strong>
        <div>UMKM</div>
      </div>

      <nav className={"nav"}>
        <Link
          href="/admin/kasir"
          className={
            isActive("/admin/kasir")
              ? "navItemActive"
              : "navItem"
          }
        >
          Manajemen Akun Kasir
        </Link>

        <Link
          href="/admin/transactions"
          className={
            isActive("/admin/transactions")
              ? "navItemActive"
              : "navItem"
          }
        >
          Pencatatan Transaksi
        </Link>

        <Link
          href="/admin/pengaturan"
          className={
            isActive("/admin/pengaturan")
              ? "navItemActive"
              : "navItem"
          }
        >
          Pengaturan
        </Link>
      </nav>
    </aside>
  );
}
