import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCategories, saveCategory, saveAllCategories, CategoryData } from "@/lib/content-manager";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error reading categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, category, allCategories } = body;

    if (allCategories) {
      await saveAllCategories(allCategories);
      return NextResponse.json({ success: true, message: "All categories updated successfully!" });
    }

    if (slug && category) {
      const updated = await saveCategory(slug, category);
      return NextResponse.json({ success: true, category: updated, message: `${slug} updated successfully!` });
    }

    return NextResponse.json({ error: "Missing slug or category data" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
