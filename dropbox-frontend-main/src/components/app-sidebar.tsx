import {
  LayoutDashboard,
  MessageCircle,
  Users,
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AuthContext } from "@/context/AuthContext"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Send Message",
      url: "/app",
      icon: MessageCircle,
    },

    {
      title: "Users",
      url: "/users",
      icon: Users,

    },

  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = React.useContext(AuthContext) as { 
    user: { 
      name: string; 
      email: string; 
      avatar: string | null; 
      role: "admin" | "hr" | "user" 
    } | null 
  }

  const navItems = React.useMemo(() => {
    let items = [...data.navMain];

    if (user?.role === "admin") {
      items = items.filter(item => item.title === "Dashboard" || item.title === "Users");
    }

    if (user?.role === "hr") {
      items = items.filter(item => item.title === "Users");
    }

    if (user?.role === "user") {
      items = items.filter(item => item.title === "Send Message");
    }

    return items;
  }, [user]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
      {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
