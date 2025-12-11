import { NextResponse } from "next/server";
import db from "@/db/db"; 

export async function GET() {
  try {
    const rooms = await db.room.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}