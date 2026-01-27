// components/app-sidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Inbox,
  Settings,
  ChevronUp,
  User2,
  LogOut,
  UsersRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/app/contexts/auth-context";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const itemsAdmin = [
    {
      title: "Home",
      url: "/admin/home",
      icon: Home,
    },
    {
      title: "Transaksi",
      url: "/admin/transaksi",
      icon: Inbox,
    },
    {
      title: "Manajemen Kasir",
      url: "/admin/manajemen-kasir",
      icon: UsersRound,
    },
    {
      title: "Pengaturan",
      url: "/admin/pengaturan",
      icon: Settings,
    },
  ];

  const itemsKasir = [
    {
      title: "Transaksi",
      url: "/kasir/transaksi",
      icon: Inbox,
    },
    {
      title: "Pengaturan",
      url: "/kasir/pengaturan",
      icon: Settings,
    },
  ];

  // Show loading state only while initially loading
  if (isLoading) {
    return (
      <Sidebar>
        <SidebarContent className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Memuat menu...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // If not loading but user is still null, don't render the sidebar
  // The AuthContext will redirect to login
  if (!user) {
    return null;
  }

  console.log(user, "USER")
  const items = user.role === "ADMIN" ? itemsAdmin : itemsKasir;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">CatatTrans UMKM</h2>
          <p className="text-sm text-muted-foreground">
            {user.role === "ADMIN" ? "Admin Panel" : "Kasir Panel"}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      {/* Change this line: */}
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  <span className="truncate">
                    {user.name || user.username}
                  </span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem disabled>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-xs">Role: {user.role}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}