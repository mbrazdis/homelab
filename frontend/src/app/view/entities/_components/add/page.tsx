"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import useWebSocket from "@/hooks/useWebSocket";
import { addEntity } from "@/app/view/_actions/entity";
import { useActionState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export function AddDialog() {
  const [newDevices, setNewDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);
  const { messages } = useWebSocket(WS_URL);
  const [error, action] = useActionState(addEntity, {})

  useEffect(() => {
    async function fetchRooms() {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      setRooms(data);
    }
    fetchRooms();
  }, []);

  // Actualizează lista de dispozitive noi
  useEffect(() => {
    messages.forEach((message) => {
      if (message.new_devices) {
        const devices = Object.values(
          message.new_devices as Record<
            string,
            { id: string; name: string; type: string }
          >
        );
        setNewDevices((prev) => {
          const uniqueDevices = devices.filter(
            (device: { id: string }) => !prev.some((d) => d.id === device.id)
          );
          return [...prev, ...uniqueDevices];
        });
      }
    });
  }, [messages]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Device</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {newDevices.length > 0 ? (
            newDevices.map((device) => (
              <div
                key={device.id}
                className="border p-4 rounded-md shadow-sm cursor-pointer"
                onClick={() => setSelectedDevice(device)}
              >
                <p>
                  <strong>Name:</strong> {device.name}
                </p>
                <p>
                  <strong>Type:</strong> {device.type}
                </p>
              </div>
            ))
          ) : (
            <p>No new devices found.</p>
          )}
        </div>
      </DialogContent>

      {/* Formular pentru dispozitivul selectat */}
      {selectedDevice && (
        <Dialog
          open={!!selectedDevice}
          onOpenChange={() => setSelectedDevice(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
            </DialogHeader>
            <form action={action}>
              <div className="grid gap-4 py-4">
                {/* ID (read-only) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="id" className="text-right">
                    ID
                  </Label>
                  <Input
                    id="id"
                    name="id"
                    value={selectedDevice.id}
                    readOnly
                    className="col-span-3"
                  />
                </div>

                {/* Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedDevice.name}
                    className="col-span-3"
                  />
                </div>

                {/* Type */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    name="type"
                    defaultValue={selectedDevice.type || "light"}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="plug">Plug</SelectItem>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Manufacturer */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manufacturer" className="text-right">
                    Manufacturer
                  </Label>
                  <Select
                    name="manufacturer"
                    defaultValue={selectedDevice.manufacturer || "other"}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select a manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shelly">Shelly</SelectItem>
                      <SelectItem value="sonoff">Sonoff</SelectItem>
                      <SelectItem value="aqara">Aqara</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Model */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">
                    Model
                  </Label>
                  <Input
                    id="model"
                    name="model"
                    defaultValue={selectedDevice.type}
                    className="col-span-3"
                    readOnly
                  />
                </div>

                {/* Room */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="room" className="text-right">
                    Room
                  </Label>
                  <Select
                    name="roomId"
                    onValueChange={(value) => {
                      if (value === "none") {
                        setSelectedRooms([]); // Resetează camerele selectate
                      } else {
                        setSelectedRooms((prev) => [...prev, value]); // Adaugă camera selectată
                      }
                    }}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select rooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="none">None</SelectItem>{" "}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
