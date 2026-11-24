import { NextRequest, NextResponse } from "next/server";
import { getCategories, getCategoryBySlug } from "@/lib/content-manager";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const category = await getCategoryBySlug(slug);
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ category });
    }

    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error reading categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
