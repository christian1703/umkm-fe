// app/layout.tsx
import "./global.css";

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
        {children}
      </body>
    </html>
  );
}