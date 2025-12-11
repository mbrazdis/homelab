import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardCard } from "@/components/customComponents/dashboardCard";
import db from "@/db/db";
import { CalendarAppleCard } from "@/components/customComponents/calendarApple";
import { WeatherCard } from "@/components/customComponents/weatherCard";

export default async function Page() {
  const rooms = await db.room.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      entities: {
        select: {
          name: true,
          id: true,
        },
      },
      image: true,
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">DashBoard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-col gap-4 p-4 pt-0">
          <div className="grid lg:grid-cols-5 xl:grid-cols-6 grid-cols-1 gap-4">
            

            {/* Coloana stanga */}
            <div className="bg-muted/50 rounded-xl xl:col-span-4 lg:col-span-3  sm:col-span-1 col-span-1 flex lg:order-first">

              <div className="bg-muted/50 flex-1 p-2 rounded-xl flex-col">
                <div className="flex flex-col gap-4 pt-0 ">
                  {/* Grilă pentru carduri */}
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {rooms.map((room) => (
                      <DashboardCard
                        key={room.id}
                        name={room.name}
                        image={room.image ?? ""}
                        entities={room.entities.map((entity) => entity.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Coloana dreapta */}
            <div className="flex-col gap-1 xl:col-span-2 md:col-span-1 lg:col-span-2 col-span-1 grid lg:grid-cols-1 grid-cols-2 ">
              <div className="aspect-video rounded-xl flex ">
                    <CalendarAppleCard />
              </div>
              <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
                    <WeatherCard />
              </div>
              <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
              
              </div>
              <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
              
              </div>
            </div>
            
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
