import { getStore } from "@netlify/blobs";
import fs from "fs/promises";
import path from "path";

const STORE_CONTENT = "propvista-content";
const STORE_UPLOADS = "propvista-uploads";

/**
 * Reads JSON data from Netlify Blobs if available, falling back to local file.
 */
export async function getJSONFromStorage<T>(
  key: string,
  localFilePath: string,
  defaultData: T
): Promise<T> {
  // 1. Try reading from Netlify Blobs
  try {
    const store = getStore(STORE_CONTENT);
    const data = await store.get(key, { type: "json" });
    if (data !== null && data !== undefined) {
      return data as T;
    }
  } catch (blobErr) {
    // Blobs not available or local development without Netlify CLI
  }

  // 2. Fall back to reading from local file system
  try {
    const raw = await fs.readFile(localFilePath, "utf-8");
    const parsed = JSON.parse(raw) as T;

    // If on Netlify (store works but was empty on first run), seed it
    try {
      const store = getStore(STORE_CONTENT);
      await store.setJSON(key, parsed);
    } catch {
      // Ignore if not on Netlify
    }

    return parsed;
  } catch {
    return defaultData;
  }
}

/**
 * Saves JSON data to Netlify Blobs (primary for serverless) and local file (for local dev).
 */
export async function saveJSONToStorage<T>(
  key: string,
  localFilePath: string,
  data: T
): Promise<void> {
  let savedToBlob = false;

  // 1. Try Netlify Blobs first (works on Netlify serverless where fs is read-only)
  try {
    const store = getStore(STORE_CONTENT);
    await store.setJSON(key, data);
    savedToBlob = true;
  } catch (blobErr) {
    // Not running on Netlify or Blobs not configured
  }

  // 2. Try writing to local file system
  try {
    // Ensure parent directory exists
    const dir = path.dirname(localFilePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(localFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (fsErr: unknown) {
    const isReadOnly =
      (fsErr && typeof fsErr === "object" && "code" in fsErr && (fsErr as { code?: string }).code === "EROFS") ||
      (fsErr instanceof Error && fsErr.message.includes("read-only file system"));

    // If on Netlify read-only filesystem and successfully saved to Blobs, this is expected and safe!
    if (isReadOnly && savedToBlob) {
      return;
    }

    // If not saved to blob and local write failed, rethrow
    if (!savedToBlob) {
      throw fsErr;
    }
  }
}

/**
 * Saves uploaded file to Netlify Blobs and local public/uploads directory.
 */
export async function saveUploadedFile(
  fileName: string,
  data: ArrayBuffer | Buffer,
  contentType: string
): Promise<string> {
  let savedToBlob = false;
  const buffer: Buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

  // 1. Save to Netlify Blobs
  try {
    const store = getStore(STORE_UPLOADS);
    const blob = new Blob([data as unknown as BlobPart], { type: contentType });
    await store.set(fileName, blob, {
      metadata: { contentType },
    });
    savedToBlob = true;
  } catch (err) {
    // Ignore if not on Netlify
  }

  // 2. Try saving to local public/uploads directory
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, fileName), buffer);
  } catch (fsErr: unknown) {
    const isReadOnly =
      (fsErr && typeof fsErr === "object" && "code" in fsErr && (fsErr as { code?: string }).code === "EROFS") ||
      (fsErr instanceof Error && fsErr.message.includes("read-only file system"));

    if (isReadOnly && savedToBlob) {
      return `/uploads/${fileName}`;
    }

    if (!savedToBlob) {
      throw fsErr;
    }
  }

  return `/uploads/${fileName}`;
}

/**
 * Lists all uploaded files from Netlify Blobs and local directory.
 */
export async function listUploadedFiles(): Promise<Array<{ name: string; url: string }>> {
  const fileMap = new Map<string, { name: string; url: string }>();

  // 1. From Netlify Blobs
  try {
    const store = getStore(STORE_UPLOADS);
    const { blobs } = await store.list();
    for (const b of blobs) {
      fileMap.set(b.key, { name: b.key, url: `/uploads/${b.key}` });
    }
  } catch {
    // Ignore
  }

  // 2. From local directory
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const files = await fs.readdir(uploadsDir);
    for (const name of files) {
      if (/\.(jpg|jpeg|png|webp|avif|svg)$/i.test(name)) {
        fileMap.set(name, { name, url: `/uploads/${name}` });
      }
    }
  } catch {
    // Ignore
  }

  return Array.from(fileMap.values()).reverse();
}

/**
 * Gets an uploaded file as ArrayBuffer and its Content-Type.
 */
export async function getUploadedFile(
  fileName: string
): Promise<{ data: ArrayBuffer | Buffer; contentType: string } | null> {
  // 1. Try Netlify Blobs
  try {
    const store = getStore(STORE_UPLOADS);
    const result = await store.getWithMetadata(fileName, { type: "arrayBuffer" });
    if (result && result.data) {
      const meta = result.metadata as { contentType?: string } | undefined;
      return {
        data: result.data,
        contentType: meta?.contentType || "image/jpeg",
      };
    }
  } catch {
    // Ignore
  }

  // 2. Try local file
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    const data = await fs.readFile(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".svg": "image/svg+xml",
    };
    return {
      data,
      contentType: mimeMap[ext] || "application/octet-stream",
    };
  } catch {
    return null;
  }
}
