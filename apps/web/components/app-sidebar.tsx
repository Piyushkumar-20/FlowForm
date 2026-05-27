"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconArticle,
  IconCompass,
  IconShield,
  IconCreditCard,
} from "@tabler/icons-react"

import { NavDocuments } from "~/components/nav-documents"
import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavUser } from "~/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { useUser } from "~/hooks/api/auth"

const baseNavMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Forms",
    url: "/dashboard/forms",
    icon: IconArticle,
  },
  {
    title: "Explore",
    url: "/explore",
    icon: IconCompass,
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: IconCreditCard,
  },
];

const adminNavItem = {
  title: "Admin",
  url: "/admin",
  icon: IconShield,
};

const navSecondary = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  const navMain = user?.role === "ADMIN"
    ? [...baseNavMain, adminNavItem]
    : baseNavMain;

  const sidebarUser = {
    name: user?.fullName ?? "User",
    email: user?.email ?? "",
    avatar: user?.profileImageUrl ?? "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Form Flow.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={[]} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
