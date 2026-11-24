import { NextRequest, NextResponse } from "next/server";
import { getUploadedFile } from "@/lib/storage-adapter";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const file = await getUploadedFile(filename);

    if (!file) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving file";
    return new NextResponse(message, { status: 500 });
  }
}
