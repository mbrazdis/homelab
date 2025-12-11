import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import db from "@/db/db";
import { AddDialog } from "./_components/add/page";

async function getEntities() {
  return await db.entity.findMany({
    include: {
      linkedEntity: true,
      linkedBy: true,
    },
  });
}

export default function Page() {
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
                  <BreadcrumbLink href="#">View Entities</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <AddDialog />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <Table>
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Linked Room</TableHead>
                  <TableHead>Linked Entities</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getEntities().then((entities) =>
                  entities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell>{entity.id}</TableCell>
                      <TableCell>{entity.name}</TableCell>
                      <TableCell>{entity.type}</TableCell>
                      <TableCell>{entity.manufacturer}</TableCell>
                      <TableCell>{entity.model}</TableCell>
                      <TableCell>
                        {entity.roomId
                          ? db.room
                              .findUnique({ where: { id: entity.roomId } })
                              .then((room) => room?.name || "Unknown Room")
                          : "No Room"}
                      </TableCell>
                      <TableCell>
                        {entity.linkedEntity.map((linked, index) => (
                          <span key={index}>{linked.name}</span>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <button>Edit</button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
