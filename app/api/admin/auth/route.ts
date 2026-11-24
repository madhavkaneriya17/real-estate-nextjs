import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const AUTH_COOKIE_NAME = "admin_session";
const CONFIG_PATH = path.join(process.cwd(), "data", "admin-config.json");

async function getStoredPassword(): Promise<string> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    const json = JSON.parse(raw);
    if (json.password) return json.password;
  } catch (err) {
    // Fallback if file doesn't exist
  }
  return process.env.ADMIN_PASSWORD || "admin123";
}

async function setStoredPassword(newPassword: string): Promise<void> {
  const config = {
    password: newPassword,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);

  if (session && session.value === "authenticated") {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const currentPassword = await getStoredPassword();

    if (!password || password !== currentPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Logged in successfully" });

    // Set cookie
    response.cookies.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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

    const body = await request.json();
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
    if (currentPassword !== storedPassword) {
      return NextResponse.json(
        { error: "Current password does not match." },
        { status: 400 }
      );
    }

    await setStoredPassword(newPassword.trim());

    return NextResponse.json({
      success: true,
      message: "Admin password successfully updated!",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
