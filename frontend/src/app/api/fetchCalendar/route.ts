import { NextResponse } from "next/server";

export async function GET() {
  const calendarUrl = "https://p120-caldav.icloud.com/published/2/MTYzMjI2MTU2MTkxNjMyMkcDFJ3lbaNjPPZqa6KG2cHDDq-rvM9P4lMkDUhYXQml";

  try {
    console.log("Fetching calendar from URL:", calendarUrl);
    const response = await fetch(calendarUrl);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.statusText}`);
    }

    const icsData = await response.text();
    if (!icsData || icsData.trim() === "") {
      throw new Error("Received empty ICS data");
    }

    return NextResponse.json({ icsData });
  } catch (error) {
    console.error("Failed to fetch calendar:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}