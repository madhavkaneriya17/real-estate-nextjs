import { NextResponse } from "next/server";
import { getSiteContent, getCategories } from "@/lib/content-manager";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const siteContent = await getSiteContent();
    const categories = await getCategories();
    return NextResponse.json({ siteContent, categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error reading content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
