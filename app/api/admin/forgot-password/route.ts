import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getJSONFromStorage, saveJSONToStorage } from "@/lib/storage-adapter";

export const dynamic = "force-dynamic";

const OTP_PATH = path.join(process.cwd(), "data", "admin-otp.json");
const CONFIG_PATH = path.join(process.cwd(), "data", "admin-config.json");

interface OtpRecord {
  otp?: string;
  email?: string;
  expiresAt?: number;
}

interface AdminConfig {
  password?: string;
  updatedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, otp, newPassword } = body;

    if (action === "send-otp") {
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

      if (allowedEmail && normalizedEmail !== allowedEmail) {
        return NextResponse.json(
          { error: "This email is not authorized for admin password reset." },
          { status: 403 }
        );
      }

      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        return NextResponse.json(
          {
            error:
              "Email service is not configured yet. Please add RESEND_API_KEY in Netlify Environment Variables.",
          },
          { status: 500 }
        );
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      await saveJSONToStorage<OtpRecord>("admin-otp", OTP_PATH, {
        otp: generatedOtp,
        email: normalizedEmail,
        expiresAt,
      });

      const fromEmail = process.env.RESEND_FROM_EMAIL || "PROPVISTA Admin <onboarding@resend.dev>";

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [normalizedEmail],
          subject: "PROPVISTA Admin - Password Reset OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #111827; margin-top: 0;">PROPVISTA Admin Password Reset</h2>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
                Use the following 6-digit verification code to reset your admin panel password. This code is valid for <strong>10 minutes</strong>.
              </p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827;">${generatedOtp}</span>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">
                If you did not request this password reset, you can safely ignore this email.
              </p>
            </div>
          `,
        }),
      });

      if (!emailRes.ok) {
        const errData = await emailRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            error:
              errData?.message ||
              "Failed to send OTP email. Please check your RESEND_API_KEY.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "A 6-digit OTP has been sent to your email.",
      });
    }

    if (action === "verify-otp") {
      if (!email || !otp) {
        return NextResponse.json(
          { error: "Email and OTP are required." },
          { status: 400 }
        );
      }

      const stored = await getJSONFromStorage<OtpRecord>("admin-otp", OTP_PATH, {});
      if (!stored.otp || !stored.email || !stored.expiresAt) {
        return NextResponse.json(
          { error: "No active OTP found. Please request a new one." },
          { status: 400 }
        );
      }

      if (Date.now() > stored.expiresAt) {
        return NextResponse.json(
          { error: "OTP has expired. Please request a new one." },
          { status: 400 }
        );
      }

      if (
        stored.email.toLowerCase() !== email.trim().toLowerCase() ||
        stored.otp !== otp.trim()
      ) {
        return NextResponse.json(
          { error: "Invalid OTP. Please check your email and try again." },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === "reset-password") {
      if (!email || !otp || !newPassword) {
        return NextResponse.json(
          { error: "Email, OTP, and new password are required." },
          { status: 400 }
        );
      }

      if (typeof newPassword !== "string" || newPassword.length < 4) {
        return NextResponse.json(
          { error: "New password must be at least 4 characters long." },
          { status: 400 }
        );
      }

      const stored = await getJSONFromStorage<OtpRecord>("admin-otp", OTP_PATH, {});
      if (
        !stored.otp ||
        !stored.email ||
        !stored.expiresAt ||
        Date.now() > stored.expiresAt ||
        stored.email.toLowerCase() !== email.trim().toLowerCase() ||
        stored.otp !== otp.trim()
      ) {
        return NextResponse.json(
          { error: "OTP is invalid or expired. Please start over." },
          { status: 400 }
        );
      }

      await saveJSONToStorage<AdminConfig>("admin-config", CONFIG_PATH, {
        password: newPassword,
        updatedAt: new Date().toISOString(),
      });

      // Clear used OTP
      await saveJSONToStorage<OtpRecord>("admin-otp", OTP_PATH, {});

      return NextResponse.json({
        success: true,
        message: "Password has been reset successfully! You can now sign in.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to process forgot password request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
