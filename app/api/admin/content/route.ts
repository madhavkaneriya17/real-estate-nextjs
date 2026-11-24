import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteContent, saveSiteContent, SiteContent } from "@/lib/content-manager";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error reading content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SiteContent;
    if (!body || !body.hero || !body.selectionCards) {
      return NextResponse.json({ error: "Invalid data payload" }, { status: 400 });
    }

    await saveSiteContent(body);
    return NextResponse.json({ success: true, message: "Site content updated successfully!" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
