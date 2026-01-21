// app/layout.tsx
import { Toaster } from "@/components/ui/sonner";
import "./global.css";
import { Providers } from "./provider";

export const metadata = {
  title: "CatatTrans UMKM",
  description: "Aplikasi Pencatatan Transaksi UMKM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Toaster/>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}