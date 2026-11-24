import { getStore } from "@netlify/blobs";
import fs from "fs/promises";
import path from "path";
import os from "os";

const STORE_CONTENT = "propvista-content";
const STORE_UPLOADS = "propvista-uploads";

// Memory cache for active serverless lambda instances
const memoryJSON = new Map<string, unknown>();
const memoryUploads = new Map<string, { data: Buffer; contentType: string }>();

/**
 * Returns a Netlify Blobs store.
 * Supports explicit credentials (NETLIFY_SITE_ID & NETLIFY_API_TOKEN)
 * as well as standard automatic context injection.
 */
function getBlobStore(storeName: string) {
  const siteID =
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID;
  const token =
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_TOKEN ||
    process.env.NETLIFY_ACCESS_TOKEN;

  if (siteID && token) {
    return getStore({ name: storeName, siteID, token });
  }

  return getStore(storeName);
}

/**
 * Gets a writable file path in the OS temporary directory (/tmp on Linux / serverless).
 */
function getTmpPath(subdir: string, filename: string): string {
  return path.join(os.tmpdir(), "propvista", subdir, filename);
}

/**
 * Reads JSON data from Memory -> Netlify Blobs -> /tmp file -> local bundled file.
 */
export async function getJSONFromStorage<T>(
  key: string,
  localFilePath: string,
  defaultData: T
): Promise<T> {
  // 1. Check in-memory instance cache first
  if (memoryJSON.has(key)) {
    return memoryJSON.get(key) as T;
  }

  // 2. Try reading from Netlify Blobs
  try {
    const store = getBlobStore(STORE_CONTENT);
    const data = await store.get(key, { type: "json" });
    if (data !== null && data !== undefined) {
      memoryJSON.set(key, data);
      return data as T;
    }
  } catch (blobErr) {
    // Blobs not available or credentials missing
  }

  // 3. Try reading from /tmp directory (writable scratch space in serverless)
  try {
    const tmpFile = getTmpPath("data", `${key}.json`);
    const raw = await fs.readFile(tmpFile, "utf-8");
    const parsed = JSON.parse(raw) as T;
    memoryJSON.set(key, parsed);
    return parsed;
  } catch {
    // Not present in /tmp
  }

  // 4. Fall back to bundled local file system
  try {
    const raw = await fs.readFile(localFilePath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    memoryJSON.set(key, parsed);

    // Seed Blobs if available
    try {
      const store = getBlobStore(STORE_CONTENT);
      await store.setJSON(key, parsed);
    } catch {
      // Ignore if Blobs isn't configured yet
    }

    return parsed;
  } catch {
    return defaultData;
  }
}

/**
 * Saves JSON data to Memory -> Netlify Blobs -> /tmp -> local file system.
 * Handles read-only filesystems (EROFS on Netlify / AWS Lambda) gracefully without throwing errors.
 */
export async function saveJSONToStorage<T>(
  key: string,
  localFilePath: string,
  data: T
): Promise<void> {
  // 1. Immediately store in memory
  memoryJSON.set(key, data);

  let savedToBlob = false;

  // 2. Try saving to Netlify Blobs (primary persistent cloud store)
  try {
    const store = getBlobStore(STORE_CONTENT);
    await store.setJSON(key, data);
    savedToBlob = true;
  } catch (blobErr) {
    console.warn(`[StorageAdapter] Netlify Blobs save skipped for "${key}":`, blobErr instanceof Error ? blobErr.message : blobErr);
  }

  // 3. Save to /tmp directory (always writable on Netlify Functions / Lambda)
  try {
    const tmpFile = getTmpPath("data", `${key}.json`);
    await fs.mkdir(path.dirname(tmpFile), { recursive: true });
    await fs.writeFile(tmpFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (tmpErr) {
    console.warn(`[StorageAdapter] /tmp write skipped:`, tmpErr);
  }

  // 4. Try saving to local workspace directory (for local dev environments)
  try {
    const dir = path.dirname(localFilePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(localFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (fsErr: unknown) {
    const isReadOnly =
      (fsErr && typeof fsErr === "object" && "code" in fsErr && (fsErr as { code?: string }).code === "EROFS") ||
      (fsErr instanceof Error && fsErr.message.includes("read-only file system"));

    // In serverless, /var/task is read-only. We have already preserved data in memory & /tmp.
    if (isReadOnly) {
      console.log(`[StorageAdapter] Serverless read-only filesystem handled safely for "${key}".`);
      return;
    }

    // If local write fails with a non-EROFS error and blobs failed too, rethrow
    if (!savedToBlob) {
      throw fsErr;
    }
  }
}

/**
 * Saves uploaded file to Memory, Netlify Blobs, /tmp, and public/uploads.
 */
export async function saveUploadedFile(
  fileName: string,
  data: ArrayBuffer | Buffer,
  contentType: string
): Promise<string> {
  const buffer: Buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  memoryUploads.set(fileName, { data: buffer, contentType });

  let savedToBlob = false;

  // 1. Netlify Blobs
  try {
    const store = getBlobStore(STORE_UPLOADS);
    const blob = new Blob([new Uint8Array(buffer)], { type: contentType });
    await store.set(fileName, blob, {
      metadata: { contentType },
    });
    savedToBlob = true;
  } catch (err) {
    console.warn(`[StorageAdapter] Blobs upload save skipped:`, err instanceof Error ? err.message : err);
  }

  // 2. /tmp directory
  try {
    const tmpUploadPath = getTmpPath("uploads", fileName);
    await fs.mkdir(path.dirname(tmpUploadPath), { recursive: true });
    await fs.writeFile(tmpUploadPath, buffer);
  } catch (tmpErr) {
    // Ignore /tmp errors
  }

  // 3. Local public/uploads directory (local dev)
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, fileName), buffer);
  } catch (fsErr: unknown) {
    const isReadOnly =
      (fsErr && typeof fsErr === "object" && "code" in fsErr && (fsErr as { code?: string }).code === "EROFS") ||
      (fsErr instanceof Error && fsErr.message.includes("read-only file system"));

    if (isReadOnly) {
      // In serverless, file is available via memory, blobs, and /tmp
      return `/uploads/${fileName}`;
    }

    if (!savedToBlob) {
      throw fsErr;
    }
  }

  return `/uploads/${fileName}`;
}

/**
 * Lists all uploaded files across Blobs, /tmp, and local uploads directory.
 */
export async function listUploadedFiles(): Promise<Array<{ name: string; url: string }>> {
  const fileMap = new Map<string, { name: string; url: string }>();

  // 1. From memory
  for (const name of memoryUploads.keys()) {
    fileMap.set(name, { name, url: `/uploads/${name}` });
  }

  // 2. From Netlify Blobs
  try {
    const store = getBlobStore(STORE_UPLOADS);
    const { blobs } = await store.list();
    for (const b of blobs) {
      fileMap.set(b.key, { name: b.key, url: `/uploads/${b.key}` });
    }
  } catch {
    // Blobs not available
  }

  // 3. From /tmp directory
  try {
    const tmpUploadsDir = path.join(os.tmpdir(), "propvista", "uploads");
    const files = await fs.readdir(tmpUploadsDir);
    for (const name of files) {
      if (/\.(jpg|jpeg|png|webp|avif|svg)$/i.test(name)) {
        fileMap.set(name, { name, url: `/uploads/${name}` });
      }
    }
  } catch {
    // Ignore
  }

  // 4. From local workspace directory
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
  // 1. From memory
  if (memoryUploads.has(fileName)) {
    const item = memoryUploads.get(fileName)!;
    return { data: item.data, contentType: item.contentType };
  }

  // 2. From Netlify Blobs
  try {
    const store = getBlobStore(STORE_UPLOADS);
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

  // 3. From /tmp directory
  try {
    const tmpUploadPath = getTmpPath("uploads", fileName);
    const data = await fs.readFile(tmpUploadPath);
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
    // Ignore
  }

  // 4. From local public/uploads directory
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
