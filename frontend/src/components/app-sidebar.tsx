"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  CirclePlus,
  Command,
  Frame,
  GalleryVerticalEnd,
  Heater,
  House,
  LayoutDashboard,
  Lightbulb,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "HOMELAB",
      logo: House,
      plan: "Appartment",
    },
  ],
  navMain: [
    {
      title: "View",
      url: "#",
      icon: CirclePlus,
      items: [
        {
          title: "List Entities",
          url: "/view/entities",
        },
        {
          title: "List Rooms",
          url: "/view/rooms",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Wifi",
          url: "#",
        },
        {
          title: "MQTT",
          url: "#",
        },
        {
          title: "Zigbee",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Lighting",
      url: "/lights",
      icon: Lightbulb,
    },
    {
      name: "Heating",
      url: "/heating",
      icon: Heater,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>        
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
