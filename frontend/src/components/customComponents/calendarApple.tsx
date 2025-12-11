"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
let ICAL: any;
(async () => {
  ICAL = (await import("ical.js")).default;
})();

export async function fetchICSEvents() {
  try {
    const response = await fetch("/api/fetchCalendar");
    const { icsData } = await response.json();

    if (!icsData || icsData.trim() === "") {
      throw new Error("Received empty ICS data");
    }

    // Parsează fișierul .ics folosind ical.js
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents("vevent").map((vevent: any) => {
      const event = new ICAL.Event(vevent);
      return {
        summary: event.summary,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        location: event.location,
      };
    });

    return events;
  } catch (error) {
    console.error("Failed to fetch ICS events:", error);
    return [];
  }
}
export function CalendarAppleCard() {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const fetchedEvents = await fetchICSEvents();
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load calendar events.");
      }
    }
    fetchEvents();
  }, []);

  const upcomingEvents = events
    .filter((event) => new Date(event.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 2);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer h-full w-full shadow-sm hover:shadow-md transition-shadow duration-300 gap-1 py-2 rounded-lg">
          <CardHeader className="px-4 flex items-center justify-between">
            <CardTitle className="text-[1.6vw] font-semibold">
              Calendar
            </CardTitle>
            <CalendarIcon className="h-4 w-4" />
          </CardHeader>
          <CardContent className="gap-0">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : upcomingEvents.length > 0 ? (
              <ul className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <li
                    key={index}
                    className="flex items-start bg-transparent-30 rounded-lg shadow-md hover:shadow-lg transition-shadow border"
                  >
                    {/* Indicator colorat */}
                    <div
                      className={`w-2 h-full rounded-lg shrink-0 ${
                        event.summary.includes("Shift")
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    />
                    {/* Conținut eveniment */}
                    <div className="min-w-0 grid-cols-3 p-2">
                      <div className="flex items-center gap-2 col-span-1">
                        {/* Data evenimentului */}
                        <p className="text-gray-500 text-[2vw] sm:text-[1.5vw] md:text-[1vw] lg:text-[1.1vw] xl:text-[1.3vw] font-medium truncate">
                          {new Date(event.start).toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>

                        {/* Ora evenimentului */}
                        <div className="flex items-center gap-2 text-gray-500 text-[2vw] sm:text-[1.5vw] md:text-[1vw] lg:text-[1.1vw] xl:text-[1.3vw] ">
                          <ClockIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {new Date(event.start).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(event.end).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-[2vw] sm:text-[1.5vw] md:text-[1vw] lg:text-[1.1vw] xl:text-[1.3vw] font-semibold truncate col-span-2">
                        {event.summary}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center">No upcoming events.</p>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>All Events</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : events.length > 0 ? (
            <ul className="space-y-4">
              {events.map((event, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-full rounded-lg ${
                      event.summary.includes("Shift")
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="text-gray-500 text-sm">
                      {new Date(event.start).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-lg font-medium">{event.summary}</p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {new Date(event.start).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -
                        {new Date(event.end).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">No events found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
