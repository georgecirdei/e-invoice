"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDashboard,
  IconFileInvoice,
  IconUsers,
  IconCreditCard,
  IconChartBar,
  IconDatabase,
  IconFileText,
  IconFileSpreadsheet,
  IconBuilding,
  IconSettings,
} from "@tabler/icons-react"
import { useAuthStore } from "@/store/authStore"

import { NavMain } from "@/components/layout/nav-main"
import { NavDocuments } from "@/components/layout/nav-documents"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: IconFileInvoice,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: IconUsers,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: IconCreditCard,
    },
    {
      title: "Compliance",
      url: "/compliance",
      icon: IconBuilding,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconChartBar,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()

  // Add admin navigation if user is SUPER_ADMIN
  const navMainWithAdmin = user?.role === 'SUPER_ADMIN' 
    ? [...data.navMain]
    : data.navMain

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconFileInvoice className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">E-Invoice</span>
                  <span className="truncate text-xs">Electronic Invoicing</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithAdmin} />
        {user?.role === 'SUPER_ADMIN' && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin Panel">
                    <Link href="/admin">
                      <IconSettings />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

