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
} from "@/components/ui/sidebar"
import { Home, Inbox, Settings, ChevronUp, User2, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { AppRole } from "@/app/utils/role"
import { AuthService, User } from "@/app/utils/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type AppSidebarProps = {
    appRole: AppRole
}

export function AppSidebar() {
    const router = useRouter();
    const [user, setUser] = useState<User>();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setUser(user);
        }
    }, []);

    const handleLogout = () => {
        AuthService.logout();
        router.push("/login");
        router.refresh();
    };

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
            title: "Pengaturan",
            url: "/admin/pengaturan",
            icon: Settings,
        },
    ]

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
    ]

    const items = user?.role === 'ADMIN' ? itemsAdmin : itemsKasir 

    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
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
                                    <User2 /> {user?.username}
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem>
                                    <span>Role: {user?.role}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}