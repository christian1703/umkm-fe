// app/(dashboard)/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/auth-provider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <SidebarProvider>
                <AppSidebar/>
                <main className="w-full">
                    <SidebarTrigger />
                    {children}
                </main>
            </SidebarProvider>
        </AuthProvider>
    );
}