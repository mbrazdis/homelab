"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Icon } from "lucide-react";
import { LightCard } from "./lightCard";

interface DashboardCardProps {
  name: string;
  image: string;
}

  export function DashboardCard({ name, image, entities }: { name: string; image: string, entities: any[] }) {
    const [activeSection, setActiveSection] = useState("home"); // Starea pentru secțiunea activă
  return (
    <>
      {/* Card-ul */}
      <Dialog onOpenChange={(open) => setActiveSection(open ? "home" : "")}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer shadow-sm hover:shadow-md duration-300 rounded-lg border opacity-100 hover:opacity-70 transition-opacity">
            <CardContent className="relative">
              <img
                src={image ?? ""}
                alt={name}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <div className="absolute inset-0  rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium">Click to view</p>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle className="text-base font-medium text-center">
                {name}
              </CardTitle>
              <p className="text-xs font-small text-center ">23°C</p>
            </CardHeader>
          </Card>
        </DialogTrigger>

        {/* Dialog-ul */}
        <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>

        {/* Navbar */}
        <div className="flex justify-around border-b mb-4">
          <button
            className={`py-2 px-4 ${
              activeSection === "home" ? "font-bold border-b-2 " : ""
            }`}
            onClick={() => setActiveSection("home")}
          >
            Home
          </button>
          <button
            className={`py-2 px-4 ${
              activeSection === "lighting" ? "font-bold border-b-2 " : ""
            }`}
            onClick={() => setActiveSection("lighting")}
          >
            Lighting
          </button>
          <button
            className={`py-2 px-4 ${
              activeSection === "heating" ? "font-bold border-b-2 " : ""
            }`}
            onClick={() => setActiveSection("heating")}
          >
            Heating
          </button>
        </div>

        {/* Conținut dinamic */}
        <div className="p-4">
          {activeSection === "home" && (
            <div>
              <img src={image ?? ""} alt={name} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h2 className="text-lg font-semibold mb-2">Room Details</h2>
              <p className="text-sm">Temperature: 23°C</p>
              <p className="text-sm">Humidity: 50%</p>
              <p className="text-sm">Light Level:</p> 
            </div>
          )}
          {activeSection === "lighting" && (
            <div>
              <LightCard deviceIds={entities} />
            </div>
          )}
          {activeSection === "heating" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Heating Control</h2>
              <p className="text-sm">Adjust the heating settings for this room.</p>
              <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg">
                Increase Temperature
              </button>
            </div>
          )}
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
