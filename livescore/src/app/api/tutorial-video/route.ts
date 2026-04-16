import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

const BLOB_URL =
  "https://w3tefip0msacfu96.private.blob.vercel-storage.com/tutorial.mov";

export async function GET() {
  try {
    const blob = await get(BLOB_URL, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blob?.url) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.redirect(blob.url);
  } catch {
    return NextResponse.json(
      { error: "Video unavailable" },
      { status: 500 }
    );
  }
}
