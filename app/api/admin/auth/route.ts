import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import { getJSONFromStorage, saveJSONToStorage } from "@/lib/storage-adapter";

export const dynamic = "force-dynamic";

const AUTH_COOKIE_NAME = "admin_session";
const CONFIG_PATH = path.join(process.cwd(), "data", "admin-config.json");

interface AdminConfig {
  password?: string;
  updatedAt?: string;
}

async function getStoredPassword(): Promise<string> {
  try {
    const config = await getJSONFromStorage<AdminConfig>("admin-config", CONFIG_PATH, {
      password: process.env.ADMIN_PASSWORD || "admin123",
    });
    return config.password || process.env.ADMIN_PASSWORD || "admin123";
  } catch {
    return process.env.ADMIN_PASSWORD || "admin123";
  }
}

async function setStoredPassword(newPassword: string): Promise<void> {
  const config: AdminConfig = {
    password: newPassword,
    updatedAt: new Date().toISOString(),
  };
  await saveJSONToStorage<AdminConfig>("admin-config", CONFIG_PATH, config);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE_NAME);

    if (session && session.value === "authenticated") {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error checking auth";
    return NextResponse.json({ authenticated: false, error: message }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    const storedPassword = await getStoredPassword();

    // Accept stored password, or fallback defaults admin123 / Madhav@123
    const isMatch =
      Boolean(password) &&
      (password === storedPassword ||
        password === "admin123" ||
        password === "Madhav@123");

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password. Use admin123 or Madhav@123" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Logged in successfully" });

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    response.cookies.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Change Admin Password
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE_NAME);

    if (!session || session.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    const storedPassword = await getStoredPassword();
    const isCurrentValid =
      currentPassword === storedPassword ||
      currentPassword === "admin123" ||
      currentPassword === "Madhav@123";

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Current password does not match." },
        { status: 400 }
      );
    }

    await setStoredPassword(newPassword.trim());
    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully!",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to change password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
