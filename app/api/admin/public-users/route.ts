import { db } from "@/db";
import { publicUsers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await db.query.publicUsers.findMany({
      orderBy: [desc(publicUsers.createdAt)],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
