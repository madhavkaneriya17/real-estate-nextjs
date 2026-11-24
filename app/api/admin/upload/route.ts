import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function POST(request: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create safe filename
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${timestamp}-${cleanFileName}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      size: file.size,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error uploading file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET to list uploaded files
export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const files = await fs.readdir(uploadsDir);
    
    const fileList = files
      .filter((name) => /\.(jpg|jpeg|png|webp|avif|svg)$/i.test(name))
      .map((name) => ({
        name,
        url: `/uploads/${name}`,
      }))
      .reverse();

    return NextResponse.json({ files: fileList });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error listing files";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
